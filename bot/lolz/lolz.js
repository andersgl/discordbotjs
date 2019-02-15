const _ = require('lodash')

class Lolz {
    message(message) {
        if (message.content === 'agge?!') {
            message.respondTTS(_.fill(Array(5), 'agge').join(' '))
        }

        if (message.content === 'wing') {
            message.respondTTS('wong')
        }

        if (message.content.toLowerCase().indexOf('erann') >= 0) {
            message.respond(this.randomErann())
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

module.exports = Lolz
