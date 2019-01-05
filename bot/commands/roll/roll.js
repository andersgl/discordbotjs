const Command = require('../command');

class Roll extends Command {

    init() {
        this.resetContest()
    }

    triggers() {
        return ['startroll']
    }

    help() {
        return [
            { trigger: 'roll', description: 'rul et tal' },
            { trigger: 'startroll <time> <prize>', description: 'start en konkurrence i en tidsperiode med præmie' },
        ]
    }
    
    process(msg) {
        switch (msg.trigger) {
            case 'startroll':
                this.startContent(msg)
                break
            
            case 'roll':
            default:
                const random = this.random()
                if (!this.constest) {
                    msg.respond(msg.msg.author.username + ' ruller ... ' + random)
                    return
                }

                if (this.rolls[msg.msg.author.id] !== undefined) {
                    msg.respond('Du kan kun rulle én gang')
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
                + 'Resultat\n'

            for (let user in this.rolls) {
                if (!winner || this.rolls[user].roll > winner.roll) {
                    winner = this.rolls[user]
                }
                response += this.rolls[user].username + ': ' + this.rolls[user].roll + '\n'
            }
            response += '... og vinderen er ' + winner.username
                + '```'
            
            msg.respond(response)
            
            this.resetContest()
        }, time * 1000)

        let response = 'Starter !roll konkurrence.'
        if (prize.length > 0) {
            response += ' Præmie: ' + prize + '.'
        }
        response += '\nResultatet vil blive annonceret om ' + time + ' sekunder. Kom i gang!'
        msg.respond(response)
    }

    resetContest() {
        this.contest = null
        this.rolls = {}
    }
}

module.exports = Roll
