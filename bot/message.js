const _ = require('lodash/array')

class Message {
    constructor(msg, user) {
        this.msg = msg
        this.mentions = msg.mentions;
        this.author = msg.author;
        this.user = user
        this.content = msg.content
        this.trigger = null
        this.action = null
        this.args = []
        const matches = msg.content.match(/^\!([a-zA-Z0-9æøåÆØÅ]+)/i)
        if (matches)  {
            const parts = msg.content.substring(1).split(' ')
            if (!parts.length) {
                return
            }
            this.trigger = parts.shift().toLowerCase()

            if (!parts.length) {
                return
            }
            this.action = parts.shift().toLowerCase()

            if (!parts.length) {
                return
            }
            this.args = parts
        }
    }

    isTrigger(trigger = '') {
        if (trigger) {
            return trigger === this.trigger
        }
        return this.trigger !== null
    }

    respond(text = '') {
        if (text) {
            return this.msg.channel.send(text)
        }
        return this.blankPromise()
    }

    // async await(text = '') {
    //     await this.msg.channel.awaitMessages(msg => {
    //         console.log(msg.content);
    //     })
    // }

    dm(user, text = '') {
        if (text && user) {
            user.send(text)
        }
    }

    respondTTS(text = '') {
        if (text) {
            return this.msg.channel.send(text, { tts: true })
        }
        return this.blankPromise()
    }

    reply(text = '') {
        if (text) {
            return this.msg.reply(text)
        }
        return this.blankPromise()
    }

    replyTTS(text = '') {
        if (text) {
            return this.msg.reply(text, { tts: true })
        }
        return this.blankPromise()
    }

    sendEmbeds(embeds) {
        if (!Array.isArray(embeds)) {
            embeds = [embeds]
        }
        const embed = embeds.shift()
        this.respond(embed)
            .then(msg => {
                if (embeds.length) {
                    this.sendEmbeds(embeds)
                }
            })
            .catch(console.error)
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

    blankPromise() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(null)
            }, 100)
        })
    }
}

module.exports = Message
