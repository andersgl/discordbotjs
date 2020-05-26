const _ = require('lodash')
const raaRandomizr = require('../utils/raa-randomizer')
const moment = require('moment')

class Lolz {

    constructor() {
        this.randomizr = new raaRandomizr
    }

    message(message) {
        if (message.content === 'agge?!') {
            return message.respondTTS(_.fill(Array(5), 'agge').join(' '))
        }

        if (message.content === 'wing') {
            return message.respondTTS('wong')
        }

        if (message.content === '!random') {
            return message.respondTTS(this.randomizr.random(99))
        }
        if (message.content.toLowerCase() == 'er det lan?') {
            const timeDiff = moment('2020-05-29T10:00').unix() - moment().unix();
            if (timeDiff > 0) {
                return message.respond(`Nej, der er ${timeDiff} sekunder til lan!`)
            } else {
                return message.respond('JADA! https://tenor.com/view/computer-fire-computer-on-fire-fire-computer-gif-12007576')
            }
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
