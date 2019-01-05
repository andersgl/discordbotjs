class Message {
    constructor(msg) {
        this.msg = msg
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

    isCommand() {
        return this.trigger !== null
    }

    respond(text) {
        this.msg.channel.send(text)
    }

    respondTTS(text) {
        this.msg.channel.send(text, { tts: true })
    }

    reply(text) {
        this.msg.reply(text)
    }

    replyTTS(text) {
        this.msg.reply(text, { tts: true })
    }
}

module.exports = Message
