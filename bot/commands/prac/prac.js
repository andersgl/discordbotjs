const fs = require('fs')
const moment = require('moment')
const Command = require('../command')

class Prac extends Command {

    init() {
        this.config = this.loadConfig()
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

    process(msg) {
        this.data = this.loadData()
        switch (msg.action) {
            case 'yes':
            case 'no':
            case 'maybe':
                this.update(msg.action, (msg.args.length > 0 ? msg.args[0] : this.config.defaultGame), msg.user)
                break
            case 'remove':
                this.remove((msg.args.length > 0 ? msg.args[0] : this.config.defaultGame), msg.user)
                break
            case 'help':
                msg.respond(this.showHelp())
                break
            default:
                if (msg.action) {
                    msg.respond(msg.action + ' - hvad mener du?')
                    return
                }
                this.showSummary()
                break
        }
    }

    update(action, game, user) {
        if (!this.gameIsAvailable(game)) {
            this.msg.respond(game + ' er ikke et spil jeg kender ...')
            return
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
        
        this.msg.respond('Du sagde ' + action)
        this.showSummary(game)
        this.saveData()
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

        this.msg.respond('Du er nu fjernet')
        this.showSummary(game)
        this.saveData()
    }

    showSummary(game = null) {
        if (this.noPracEntries()) {
            this.msg.respond('Du kan stadig nå at være den første der melder sig til prac i dag')
            return
        }
        let summary = ''
        const pracToday = this.data[this.currentDate()]
        for (let key in pracToday) {
            if (game !== null && key !== game) {
                continue
            }
            const entries = { yes: [], no: [], maybe: [] }
            pracToday[key].forEach(entry => {
                entries[entry.action].push(entry.name)
            })
            summary += '```diff\n'
                + key.toUpperCase() + '\n'
                + '+ ' + entries.yes.join(', ') + '\n'
                + '- ' + entries.no.join(', ') + '\n'
                + '--- ' + entries.maybe.join(', ') + '\n'
                + '```'
        }
        this.msg.respond(summary)
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

    help() {
        return [
            { trigger: 'prac', description: 'vis oversigt over tilmeldinger' },
            { trigger: 'prac yes <game?>', description: 'tilmeld dig til prac' },
            { trigger: 'prac no <game?>', description: 'afmeld til fra prac' },
            { trigger: 'prac remove <game?>', description: 'fjern din tilmelding' },
            { trigger: 'prac help', description: 'vis denne hjælpebesked' },
        ]
    }
}

module.exports = Prac;
