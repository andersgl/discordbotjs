const Command = require('../command')

class Aids extends Command {

    init() {
        this.hasAids = []
        this.userNames = {}
    }
    
    process(msg) {
        if (this.userNames[msg.msg.author.id] === undefined) {
            this.userNames[msg.msg.author.id] = msg.msg.author.username
        }
        switch (msg.trigger) {
            case 'giveaids':
                if (!msg.action) {
                    msg.respond('Hvem vil du give aids til (brug @)')
                    break
                }
                const toUser = msg.highlight2User(msg.action)
                if (!toUser) {
                    msg.respond(msg.action + ' er ikke en bruger')
                    break
                }
                msg.respond(this.giveAids(toUser, msg.msg.author.id))
                break
            case 'aids':
            default:
                switch (msg.action) {
                    case 'help':
                        msg.respond(this.showHelp())
                        break
                    case 'reset':
                        this.reset(msg.msg.author)
                        msg.respond('Aids blev nulstillet')
                        break
                    default:
                        if (!msg.action) {
                            msg.respond(this.status())
                            return
                        }

                        const userHighlight = msg.highlight2User(msg.action)
                        if (userHighlight) {
                            if (this.userHasAids(userHighlight)) {
                                msg.respond(msg.user2Highlight(userHighlight) + ' har aids!')
                            } else {
                                msg.respond(msg.user2Highlight(userHighlight) + ' har ikke aids')
                            }
                        } else {
                            msg.respond(msg.action + ' er ikke en bruger')
                        }
                        break
                }
                break
        }
    }

    reset(author) {
        this.hasAids = [];
        if (author) {
            this.hasAids.push(author.id);
        }
    }

    giveAids(toUser, fromUser) {
        if (!this.userHasAids(fromUser)) {
            return 'Du kan ikke give aids når du ikke selv har aids'
        }

        if (this.userHasAids(toUser)) {
            return this.msg.user2Highlight(toUser) + ' havde aids i forvejen, men fik lidt mere aids af ' + this.msg.user2Highlight(fromUser)
        }
        this.hasAids.push(toUser)

        return this.msg.user2Highlight(fromUser) + ' har givet aids til ' + this.msg.user2Highlight(toUser)
    }

    userHasAids(userId) {
        return this.hasAids.indexOf(userId) >= 0
    }

    status() {
        let status = ''
        if (!this.hasAids.length) {
            status = 'Ingen har aids'
        } else {
            status = 'Disse brugere har aids:\n'
                + this.hasAids.map(user => {
                    return '- ' + (this.userNames[user] !== undefined ? this.userNames[user] : this.msg.user2Highlight(user))
                }).join('\n')
        }
        return status + '\n**!aids help** for hjælp'
    }

    triggers() {
        return ['giveaids']
    }

    help() {
        return [
            { trigger: 'aids', description: 'vis aids status' },
            { trigger: 'aids <@bruger>', description: 'se om en bruger har aids' },
            { trigger: 'aids reset', description: 'kurér folk for aids' },
            { trigger: 'giveaids <@bruger>', description: 'giv aids til anden bruger' },
        ]
    }
}

module.exports = Aids
