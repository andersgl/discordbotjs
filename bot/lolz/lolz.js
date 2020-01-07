const _ = require('lodash')
const raaRandomizr = require('../utils/raa-randomizer')

class Lolz {

    constructor() {
        this.randomizr = new raaRandomizr
    }

    message(message) {
        if (message.content.toLowerCase().indexOf('erann') >= 0) {
            message.respond('ERANN FUCKING DOBBEL D')
        }

        if (message.content === 'agge?!') {
            return message.respondTTS(_.fill(Array(5), 'agge').join(' '))
        }

        if (message.content === 'wing') {
            return message.respondTTS('wong')
        }

        if (message.content === '!random') {
            return message.respondTTS(this.randomizr.random())
        }
    }

    randomErannSong() {
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
