class Command {

    constructor() {
        this.init()
    }

    triggers() {
        return []
    }

    help() {
        return [
            // { trigger: '', description: '' }
        ]
    }

    init() {
        // To be overwritten
    }

    process(msg) {
        // To be overwritten
    }

    showHelp() {
        return '**' + this.constructor.name + ' kommandoer:**\n'
            + this.help().map(help => {
                return '**!' + help.trigger + '** - ' + help.description
            }).join('\n')
            + '\n'
    }

    highlight2User(text) {
        const matches = text.match(/^\<@([\d]+)\>$/)
        if (matches) {
            return matches[1]
        }
        return null    
    }

    user2Highlight(userId) {
        if (!userId) {
            return ''
        }
        return '<@' + userId + '>'
    }

    isUserHighlight(text) {
        return this.highlight2User(text) !== null
    }
}

module.exports = Command
