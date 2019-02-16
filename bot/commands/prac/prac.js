const fs = require('fs')
const moment = require('moment')
const Command = require('../command')
const Discord = require('discord.js')
const _ = require('lodash')

class Prac extends Command {

    help() {
        return [
            { trigger: 'prac', description: 'Show prac overview of signup' },
            { trigger: 'prac yes <game?>', description: 'Sign up for prac' },
            { trigger: 'prac no <game?>', description: 'No no no, I can\'t prac' },
            { trigger: 'prac remove <game?>', description: 'Remove your prac entry' },
            { trigger: 'prac help', description: 'Show prac help' },
        ]
    }

    description() {
        return 'Wanna prac today?'
    }

    init() {
        this.config = this.loadConfig()
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
        try {
            return require(this.path('prac.json'))
        } catch (error) {
            return {}
        }
    }

    saveData() {
        try {
            fs.writeFile(this.path('prac.json'), JSON.stringify(this.data), 'utf8', () => { })
        } catch (error) {}
    }

    update(action, game, user) {
        if (!this.gameIsAvailable(game)) {
            return game + ' is not a game I know ...'
        }

        // Make sure date & game is created
        const curDate = this.currentDate()
        if (this.data[curDate] === undefined) {
            this.data[curDate] = {}
        }
        if (this.data[curDate][game] === undefined) {
            this.data[curDate][game] = []
        }

        const index = this.data[curDate][game].findIndex(entry => entry.id === user.id)
        if (index >= 0) {
            this.data[curDate][game][index].action = action
            this.data[curDate][game][index].time = moment().unix()
        } else {
            this.data[curDate][game].push({
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
        const curDate = this.currentDate()
        if (this.data[curDate][game] === undefined) {
            return
        }
        const index = this.data[curDate][game].findIndex(entry => entry.id === user.id)
        if (index >= 0) {
            this.data[curDate][game].splice(index, 1)
        }
        this.saveData()
        return 'You have beeen removed'
    }

    summary(game = null) {
        if (this.noPracEntries()) {
            return 'No prac entries today (yet)'
        }

        const pracToday = this.data[this.currentDate()]

        let pracEmbed = new Discord.RichEmbed().setColor('0xff8000');

        for (let key in pracToday) {
            if (game !== null && key !== game) {
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

    gameIsAvailable(game) {
        return this.config.games.indexOf(game) >= 0
    }

    currentDate() {
        return moment().format('YYYYMMDD')
    }
}

module.exports = Prac;
