const Discord = require('discord.js')
const _ = require('lodash/string')
const fs = require('fs')
const path = require('path')
const shell = require('shelljs')
const Message = require('./message')
const User = require('./user')

class Bot {
    constructor(config = {}) {
        this.baseDir = './bot/'
        this.config = config
        this.disabledCmds = Array.isArray(config.disabledCmds) ? config.disabledCmds : []
        this.loadCommands()
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

            // Admin commands
            let matches = null
            if (message.content === '!updatethebot') {
                this.restart(message)
            } else if (matches = msg.content.match(/^\!enable\s([a-zA-Z0-9æøåÆØÅ]+)/i)) {
                this.enableCmd(matches[1], message)
            } else if (matches = msg.content.match(/^\!disable\s([a-zA-Z0-9æøåÆØÅ]+)/i)) {
                this.disableCmd(matches[1], message)
            }

            if (message.isCommand() && this.triggers[message.trigger] !== undefined) {
                if (this.disabledCmds.indexOf(this.triggers[message.trigger]) >= 0) {
                    return // Command is disabled
                }
                this.commands[this.triggers[message.trigger]].process(message)
            } else {
                // Other for lolz stuff?
            }  
        })

        this.client.login(this.config.token)
    }

    restart(message) {
        if (!message.user.admin) {
            message.respond('Sorry, admins only')
            return
        }
        message.respond('Restarting, be right back ...')
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
            message.respond('Sorry, admins only')
            return
        }
        if (this.disabledCmds.indexOf(cmd) === -1) {
            message.respond('Disabled command: ' + cmd)
            this.disabledCmds.push(cmd)
        }
    }

    enableCmd(cmd, message) {
        if (!message.user.admin) {
            message.respond('Sorry, admins only')
            return
        }
        const index = this.disabledCmds.indexOf(cmd)
        if (index >= 0) {
            message.respond('Enabled command: ' + cmd)
            this.disabledCmds.splice(index, 1)
        }
    }

}

module.exports = Bot
