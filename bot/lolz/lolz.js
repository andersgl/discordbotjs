const _ = require('lodash')

class Lolz {
    message(message) {
        if (message.content === 'agge?!') {
            message.respondTTS(_.fill(Array(5), 'agge').join(' '))
        }

        if (message.content === 'wing') {
            message.respondTTS('wong')
        }
    }
}

module.exports = Lolz
