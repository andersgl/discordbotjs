const Discord = require('discord.js');

class Command {

    constructor() {
        this.msg = null
        this.init()
    }

    setMsg(msg) {
        this.msg = msg
        return this
    }

    description() {
        return ''
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
        let helpEmbed = new Discord.RichEmbed()
                            .setTitle(this.constructor.name + ' commands:');

        this.help().map(help => {
                helpEmbed.addField('!' + help.trigger, help.description);
        });

        return helpEmbed;
    }
}

module.exports = Command
