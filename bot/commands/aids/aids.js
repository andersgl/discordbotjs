const Command = require('../command')

class Aids extends Command {

    triggers() {
        return ['giveaids']
    }

    help() {
        return [
            { trigger: 'aids', description: 'Show aids status' },
            { trigger: 'aids <@user>', description: 'Check to see if a user has aids' },
            { trigger: 'aids reset', description: 'Cure everyone for aids - and give it to yourself' },
            { trigger: 'giveaids <@user>', description: 'Give aids to someone' },
        ]
    }

    description() {
        return 'A very offensive command'
    }

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
                    msg.respond('Who should be aidsed? (user @)')
                    break
                }
                const toUser = msg.highlight2User(msg.action)
                if (!toUser) {
                    msg.respond(msg.action + ' is not a user')
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
                        msg.respond('Aids was reset - you now have aids')
                        msg.respond(this.status())
                        break
                    default:
                        if (!msg.action) {
                            msg.respond(this.status())
                            return
                        }

                        const userHighlight = msg.highlight2User(msg.action)
                        if (userHighlight) {
                            if (this.userHasAids(userHighlight)) {
                                msg.respond(msg.user2Highlight(userHighlight) + ' has aids!')
                            } else {
                                msg.respond(msg.user2Highlight(userHighlight) + ' does not have aids')
                            }
                        } else {
                            msg.respond(msg.action + ' is not a user')
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
            return 'You cannot give aids when you are aids free'
        }

        if (this.userHasAids(toUser)) {
            return this.msg.user2Highlight(toUser) + ' had some aids already but got even more aids from ' + this.msg.user2Highlight(fromUser)
        }
        this.hasAids.push(toUser)

        return this.msg.user2Highlight(fromUser) + ' has given aids to ' + this.msg.user2Highlight(toUser)
    }

    userHasAids(userId) {
        return this.hasAids.indexOf(userId) >= 0
    }

    status() {
        let status = ''
        if (!this.hasAids.length) {
            status = 'No one has aids'
        } else {
            status = 'The following users have aids:\n'
                + this.hasAids.map(user => {
                    return '- ' + (this.userNames[user] !== undefined ? this.userNames[user] : this.msg.user2Highlight(user))
                }).join('\n')
        }
        return status + '\n**!aids help** for help'
    }
}

module.exports = Aids
