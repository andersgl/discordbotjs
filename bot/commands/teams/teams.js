const Command = require('../command')
const _ = require('lodash')
const Discord = require('discord.js')

class Teams extends Command {

    help() {
        return [
            { trigger: 'teams', description: '<player1> <player2> <player3> etc.' },
        ]
    }

    process(msg) {
        switch (msg.action) {
            case 'help':
                msg.respond(this.showHelp())
                break
            default:
                const members = msg.args
                members.unshift(msg.action)
                const teams = _.chunk(_.shuffle(members), Math.ceil(members.length / 2))
                const embed = new Discord.RichEmbed().setColor('0xff8000')
                embed.setTitle('Random teams')
                teams.forEach((team, index) => {
                    embed.addField('Team ' + (index + 1), team.join(', '))
                })
                msg.respond(embed)
                break
        }
    }
}

module.exports = Teams
