const moment = require('moment')
const Discord = require('discord.js')
const Command = require('../command')
const jsonStorage = require('../../storage/json')

class Rime extends Command {

    triggers() {
        return ['addrime', 'bait', 'baitme', 'addbait']
    }

    help() {
        return [
            { trigger: 'rime', description: 'Give me a random rime' },
            { trigger: 'addrime <rime text>', description: 'Add a rime' },
        ]
    }

    description() {
        return 'Rimes & baits ...'
    }

    init() {
        this.jsonStorage = new jsonStorage()
    }

    process(msg) {
        let type = 'rime'
        switch (msg.trigger) {

            case 'addrime':
            case 'addbait':
                type = msg.trigger.replace(/^add/, '')
                const parts = msg.args
                parts.unshift(msg.action)
                const newRime = this.addNew(parts.join(' '), msg.user, type)
                msg.respond('The ' + type + ' was added')
                msg.respond(newRime.user.username + ':')
                return msg.respondTTS(newRime.text)
                break

            default:
                if (msg.trigger.match(/^bait/)) {
                    type = 'bait'
                }
                switch(msg.action) {
                    case 'latest':
                        const lastRime = this.latest(type)
                        if (!lastRime) {
                            return msg.respond('No ' + type + ' was found')
                        }
                        msg.respond(lastRime.user.username + ':')
                        msg.respondTTS(lastRime.text)
                        break
                    default:
                        const randRime = this.random(type)
                        if (!randRime) {
                            return msg.respond('No ' + type + ' was found')
                        }
                        msg.respond(randRime.user.username + ':')
                        msg.respondTTS(randRime.text)
                        break
                }
                break
        }
    }

    random(type = 'rime') {
        const rimes = this.loadData(type)
        return !rimes.length ? null : rimes[Math.floor(Math.random() * rimes.length)]
    }
    
    latest(type = 'rime') {
        const rimes = this.loadData(type)
        return !rimes.length ? null : rimes[rimes.length-1]
    }

    addNew(text, user, type = 'rime') {
        const rimes = this.loadData(type)
        const rime = {
            text: text,
            date: moment().unix(),
            user: { id: user.id, username: user.username }
        }
        rimes.push(rime)
        this.saveData(rimes, type)
        return rime
    }

    loadData(type = 'rime') {
        return this.jsonStorage.load('rime/'+type+'s.json', [])
    }

    saveData(data, type = 'rime') {
        return this.jsonStorage.save('rime/'+type+'s.json', data)
    }
}

module.exports = Rime
