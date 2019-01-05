const Discord = require('discord.js')
const _ = require('lodash/string')
const fs = require('fs')
const path = require('path')
const Message = require('./message')

class Bot {
    constructor(config = {}) {
        this.baseDir = './bot/'
        this.config = config

        this.loadCommands()
        // this.connect()
    }

    connect() {
        this.client = new Discord.Client()

        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user.tag}!`)
        });

        this.client.on('message', msg => {
            // Skip message from bot itself
            if (msg.author.id === this.client.user.id) {
                return
            }

            const message = new Message(msg)
            if (message.isCommand() && this.triggers[message.trigger] !== undefined) {
                const result = this.commands[this.triggers[message.trigger]].process(message)
            } else {
                // Other for lolz stuff?
            }  
        })

        this.client.login(this.config.token)
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

}

module.exports = Bot
