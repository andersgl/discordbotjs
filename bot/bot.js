const Discord = require('discord.js')
const _ = require('lodash/string')
const fs = require('fs')
const path = require('path')
const shell = require('shelljs')
const winston = require('winston')
const Message = require('./message')
const User = require('./user')
const Lolz = require('./lolz/lolz')

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
                .first().send('I\'m baaaaack...')
        });

        this.client.on('message', msg => {
            try {
                this.processMsg(msg)
            } catch (error) {
                global.logger.error(error);
            }
        })

        this.client.login(this.config.token)
    }

    processMsg(msg) {
        // Skip message from bot itself
        if (msg.author.id === this.client.user.id) {
            return
        }

        const message = new Message(msg, new User(msg.author, this.config))

        // Admin commands
        let matches = null
        if (message.content === '!updateyourself') {
            return this.runUpdate(message)
        } else if (message.isTrigger('enable') && message.action) {
            return this.enableCmd(message.action, message)
        } else if (message.isTrigger('disable') && message.action) {
            return this.disableCmd(message.action, message)
        } else if (message.isTrigger('commands')) {
            return message.respond(this.commandsEmbed())
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
    }

    runUpdate(message) {
        if (!message.user.admin) {
            message.respond('Sorry, this is reserved for admins')
            return
        }
        message.respond('Rebooting and updating ...')
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
                    throw new Error('Trigger ' + trigger + ' is already used by command: ' + this.triggers[trigger])
                }
                this.triggers[trigger] = dir
            })
        })
    }

    commandsEmbed() {
        const embed = new Discord.RichEmbed().setColor('0x0000ff')
        embed.setTitle('Commands')
            .setFooter('Type !<command> help for more info on each command')
        for (let cmdName in this.commands) {
            if (this.disabledCmds.indexOf(cmdName) === -1) {
                embed.addField('!' + cmdName, this.commands[cmdName].description() || '(No description)')
            }
        }
        return embed
    }

    disableCmd(cmd, message) {
        if (!message.user.admin) {
            message.respond('Sorry, this is reserved for admins')
            return
        }
        if (this.disabledCmds.indexOf(cmd) === -1) {
            message.respond('Command disabled: ' + cmd)
            this.disabledCmds.push(cmd)
        }
    }

    enableCmd(cmd, message) {
        if (!message.user.admin) {
            message.respond('Sorry, this is reserved for admins')
            return
        }
        const index = this.disabledCmds.indexOf(cmd)
        if (index >= 0) {
            message.respond('Command enabled: ' + cmd)
            this.disabledCmds.splice(index, 1)
        }
    }
}

module.exports = Bot
