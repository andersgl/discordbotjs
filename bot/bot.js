const Discord = require('discord.js')
const _ = require('lodash/string')
const fs = require('fs')
const path = require('path')
const shell = require('shelljs')
const Message = require('./message')
const User = require('./user')
const Lolz = require('./lolz')

class Bot {
    constructor(config = {}) {
        this.baseDir = './bot/'
        this.config = config
        this.disabledCmds = Array.isArray(config.disabledCmds) ? config.disabledCmds : []
        this.loadCommands()
        this.lolz = new Lolz()
    }

    connect() {
        this.client = new Discord.Client()

        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user.tag}!`)
            this.client.channels.first().guild.channels
                .filter(channel => channel.type === 'text')
                .forEach(channel => {
                    channel.send('Hej, nu er jeg her igen!')
                })
        });

        this.client.on('message', msg => {
            // Skip message from bot itself
            if (msg.author.id === this.client.user.id) {
                return
            }

            const message = new Message(msg, new User(msg.author, this.config.admins))

            if (message.content.toLowerCase().indexOf('erann') >= 0) {
                return message.respond(this.randomErann())
            }

            // Admin commands
            let matches = null
            if (message.content === '!updatelortet') {
                return this.restart(message)
            } else if (message.isTrigger('enable') && message.action) {
                return this.enableCmd(message.action, message)
            } else if (message.isTrigger('disable') && message.action) {
                return this.disableCmd(message.action, message)
            }

            if (message.isTrigger() && this.triggers[message.trigger] !== undefined) {
                if (this.disabledCmds.indexOf(this.triggers[message.trigger]) >= 0) {
                    return // Command is disabled
                }
                this.commands[this.triggers[message.trigger]].setMsg(message).process(message)
            } else {
                // Other for lolz stuff?
                this.lolz.message(message)
            }  
        })

        this.client.login(this.config.token)
    }

    restart(message) {
        if (!message.user.admin) {
            message.respond('Beklager, du er ikke admin')
            return
        }
        message.respond('Genstarter lige mothafuckas ...')
        setTimeout(() => {
            shell.exec('./update.sh')
        }, 1000)
    }

    loadCommands() {
        this.commands = {}
        this.triggers = {}
        const commandPath = 'commands/'
        const findDirs = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())
        findDirs(this.baseDir + commandPath).forEach(dir => {
            const commandName = _.capitalize(dir)
            global[commandName] = require('./' + commandPath + dir + '/' + dir)
            this.commands[dir] = new global[commandName]()
            const triggers = this.commands[dir].triggers()
            if (triggers.indexOf(dir) === -1) {
                triggers.push(dir)
            }
            triggers.forEach(trigger => {
                if (this.triggers[trigger] !== undefined) {
                    throw new Error('Trigger ' + trigger + ' er allerede brugt af command: ' + this.triggers[trigger])
                }
                this.triggers[trigger] = dir
            })
        })
    }

    disableCmd(cmd, message) {
        if (!message.user.admin) {
            message.respond('Beklager, du er ikke admin')
            return
        }
        if (this.disabledCmds.indexOf(cmd) === -1) {
            message.respond('Kommando slået fra: ' + cmd)
            this.disabledCmds.push(cmd)
        }
    }

    enableCmd(cmd, message) {
        if (!message.user.admin) {
            message.respond('Beklager, du er ikke admin')
            return
        }
        const index = this.disabledCmds.indexOf(cmd)
        if (index >= 0) {
            message.respond('Kommando slået til: ' + cmd)
            this.disabledCmds.splice(index, 1)
        }
    }

    randomErann() {
        const tracks = [
            'I Wanna Wake Up With You: https://www.youtube.com/watch?v=Gi6xkDHXjUM',
            'Still Believing: https://www.youtube.com/watch?v=q7coEGBZMUM',
            'Stay (with me): https://www.youtube.com/watch?v=_Fxbel9l50w',
            'Hjertet ser: https://www.youtube.com/watch?v=rDM5n4l06DU',
        ]
        return tracks[Math.floor(Math.random() * tracks.length)]
    }

}

module.exports = Bot
