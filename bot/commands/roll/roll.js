const Command = require('../command');

class Roll extends Command {

    triggers() {
        return ['startroll']
    }

    help() {
        return [
            { trigger: 'roll', description: 'Roll a number (1-1000)' },
            { trigger: 'startroll <time> <prize>', description: 'Start a rolling contest' },
        ]
    }

    init() {
        this.resetContest()
    }

    process(msg) {
        switch (msg.trigger) {
            case 'help':
                msg.respond(this.showHelp())
                break
            case 'startroll':
                this.startContent(msg)
                break

            case 'roll':
            default:
                const random = this.random()
                if (!this.constest) {
                    msg.respond(msg.msg.author.username + ' rolls ... ' + random)
                    return
                }

                if (this.rolls[msg.msg.author.id] !== undefined) {
                    msg.respond('You can only roll once')
                    return
                }
                this.rolls[msg.msg.author.id] = { roll: random, username: msg.msg.author.username }
                break
        }
    }

    random() {
        return Math.floor(Math.random() * 1000) + 1
    }

    startContent(msg) {
        let time = parseInt(msg.action)
        if (!time) {
            time = 30
            msg.args.unshift(msg.action)
        }
        const prize = msg.args.join(' ')

        this.constest = setTimeout(() => {
            let winner = null
            let response = '```'
                + 'Result\n'

            for (let user in this.rolls) {
                if (!winner || this.rolls[user].roll > winner.roll) {
                    winner = this.rolls[user]
                }
                response += this.rolls[user].username + ': ' + this.rolls[user].roll + '\n'
            }
            response += '... and the winner is ' + winner.username
                + '```'

            msg.respond(response)

            this.resetContest()
        }, time * 1000)

        let response = 'Starting !roll contest...'
        if (prize.length > 0) {
            response += ' Prize: ' + prize + '.'
        }
        response += '\nResult will be annonuned in ' + time + ' seconds. Get rollin\' rollin\' rollin\'!'
        msg.respond(response)
    }

    resetContest() {
        this.contest = null
        this.rolls = {}
    }
}

module.exports = Roll
