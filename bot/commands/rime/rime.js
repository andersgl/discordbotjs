const moment = require('moment')
const Discord = require('discord.js')
const Command = require('../command')
const jsonStorage = require('../../storage/json')

class Rime extends Command {

    triggers() {
        return ['addrime']
    }

    help() {
        return [
            { trigger: 'rime', description: 'Give me a random rime' },
            { trigger: 'addrime <rime text>', description: 'Add a rime' },
        ]
    }

    description() {
        return 'Rimes ...'
    }

    init() {
        this.jsonStorage = new jsonStorage()
    }

    process(msg) {
        switch (msg.trigger) {
            case 'addrime':
                const parts = msg.args
                parts.unshift(msg.action)
                const newRime = this.addRime(parts.join(' '), msg.user)
                msg.respond('The rime was added')
                msg.respond(newRime.user.username + ':')
                return msg.respondTTS(newRime.text)
                break

            case 'rime':
            default:
                switch(msg.action) {
                    case 'latest':
                        const lastRime = this.latestRime()
                        if (!lastRime) {
                            return msg.respond('No rime was found')
                        }
                        msg.respond(lastRime.user.username + ':')
                        msg.respondTTS(lastRime.text)
                        break
                    default:
                        const randRime = this.randomRime()
                        if (!randRime) {
                            return msg.respond('No rime was found')
                        }
                        msg.respond(randRime.user.username + ':')
                        msg.respondTTS(randRime.text)
                        break
                }
                break
        }
    }

    randomRime() {
        const rimes = this.loadRimes()
        return !rimes.length ? null : rimes[Math.floor(Math.random() * rimes.length)]
    }
    
    latestRime() {
        const rimes = this.loadRimes()
        return !rimes.length ? null : rimes[rimes.length-1]
    }

    addRime(text, user) {
        const rimes = this.loadRimes()
        const rime = {
            text: text,
            date: moment().unix(),
            user: { id: user.id, username: user.username }
        }
        rimes.push(rime)
        this.saveRimes(rimes)
        return rime
    }

    loadRimes() {
        return this.jsonStorage.load('rime/rimes.json', [])
    }

    saveRimes(rimes) {
        return this.jsonStorage.save('rime/rimes.json', rimes)
    }
}

module.exports = Rime
