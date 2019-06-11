const moment = require('moment')
const Discord = require('discord.js')
const _ = require('lodash')
const Command = require('../command')
const jsonStorage = require('../../storage/json')

class Prac extends Command {

    help() {
        return [
            { trigger: 'prac', description: 'Show prac overview of signup' },
            { trigger: 'prac yes <game?>', description: 'Sign up for prac' },
            { trigger: 'prac no <game?>', description: 'No no no, I can\'t prac' },
            { trigger: 'prac remove <game?>', description: 'Remove your prac entry' },
            { trigger: 'prac help', description: 'Show prac help' },
            { trigger: 'prac games', description: 'Show available games' },
        ]
    }

    description() {
        return 'Wanna prac today?'
    }

    init() {
        this.config = this.loadConfig()
        this.jsonStorage = new jsonStorage()
    }

    process(msg) {
        this.data = this.loadData()
        let game = this.config.defaultGame
        switch (msg.action) {
            case 'yes':
            case 'no':
            case 'maybe':
                game = msg.args.length > 0 ? msg.args[0] : this.config.defaultGame
                msg.respond(this.update(msg.action, game, msg.user))
                msg.respond(this.summary(game))
                break
            case 'remove':
                game = msg.args.length > 0 ? msg.args[0] : this.config.defaultGame
                msg.respond(this.remove((msg.args.length > 0 ? msg.args[0] : this.config.defaultGame), msg.user))
                msg.respond(this.summary(game))
                break
            case 'help':
                msg.respond(this.showHelp())
                break
            case 'games':
                msg.respond(this.showGames())
                break
            default:
                if (msg.action) {
                    msg.respond(msg.action + ' - what you talking about?')
                    return
                }
                msg.respond(this.summary())
                break
        }
    }

    path(filename) {
        return __dirname + '/' + filename
    }

    loadConfig() {
        try {
            return require(this.path('config.json'))
        } catch (error) {
            return {}
        }
    }

    loadData() {
        return this.jsonStorage.load('prac/prac.json', {})
    }

    saveData() {
        return this.jsonStorage.save('prac/prac.json', this.data)
    }

    update(action, game, user) {
        const gameName = this.aliasToGame(game)
        if (!gameName) {
            return game + ' is not a game I know ...'
        }

        // Make sure date & game is created
        const curDate = this.currentDate()
        if (this.data[curDate] === undefined) {
            this.data[curDate] = {}
        }
        if (this.data[curDate][gameName] === undefined) {
            this.data[curDate][gameName] = []
        }

        const index = this.data[curDate][gameName].findIndex(entry => entry.id === user.id)
        if (index >= 0) {
            this.data[curDate][gameName][index].action = action
            this.data[curDate][gameName][index].time = moment().unix()
        } else {
            this.data[curDate][gameName].push({
                id: user.id,
                name: user.username,
                action: action,
                time: moment().unix()
            })
        }
        this.saveData()
        return 'You said ' + action
    }

    remove(game, user) {
        const gameName = this.aliasToGame(game)
        if (!gameName) {
            return game + ' is not a game I know ...'
        }

        const curDate = this.currentDate()
        if (this.data[curDate][gameName] === undefined) {
            return
        }
        const index = this.data[curDate][gameName].findIndex(entry => entry.id === user.id)
        if (index >= 0) {
            this.data[curDate][gameName].splice(index, 1)
        }
        this.saveData()
        return 'You have beeen removed'
    }

    summary(game = null) {
        const gameName = this.aliasToGame(game)
        if (this.noPracEntries()) {
            return 'No prac entries today (yet)'
        }

        const pracToday = this.data[this.currentDate()]

        let pracEmbed = new Discord.RichEmbed().setColor('0xff8000');

        for (let key in pracToday) {
            if (gameName !== null && key !== gameName) {
                continue
            }
            const entries = { yes: [], no: [], maybe: [] }

            pracToday[key].forEach(entry => {
                entries[entry.action].push(entry.name)
            })

            pracEmbed.addField(key.toUpperCase(), '\u200B');

            if (!_.isEmpty(entries.yes)) {
                pracEmbed.addField('😉 Yes', entries.yes.join(', '), true);
            }
            if (!_.isEmpty(entries.no)) {
                pracEmbed.addField('😡 No', entries.no.join(', '), true)
            }
            if (!_.isEmpty(entries.maybe)) {
                pracEmbed.addField('😰 Maybe', entries.maybe.join(', '), true);
            }

            pracEmbed.addBlankField();
        }

        return pracEmbed;
    }

    noPracEntries() {
        const curDate = this.currentDate()
        return this.data[curDate] === undefined || Object.keys(this.data[curDate]) === 0
    }

    showGames() {
        const embed = new Discord.RichEmbed().setColor('0xff8000');
        this.config.games.forEach(game => {
            embed.addField(
                game.name.toUpperCase(), 
                'Aliases: ' + game.aliases.join(', ')
            )
        })
        return embed
    }

    aliasToGame(gameAlias) {
        if (!gameAlias) {
            return gameAlias
        }
        let gameName = null
        this.config.games.forEach(game => {
            if (game.name == gameAlias.toLowerCase() || game.aliases.indexOf(gameAlias.toLowerCase()) >= 0) {
                gameName = game.name
            }
        })
        return gameName
    }

    currentDate() {
        return moment().format('YYYYMMDD')
    }
}

module.exports = Prac;
