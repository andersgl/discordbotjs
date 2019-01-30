class Command {

    constructor() {
        this.msg = null
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

    setMsg(msg) {
        this.msg = msg
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
}

module.exports = Command
