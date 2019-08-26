const _ = require('lodash')

class Lolz {
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

        const isItDayOfWeek = message.content.match(/er\sdet\s([a-zA-Z]{3,4}dag)\?/i)
        if (isItDayOfWeek) {
            const days = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag']
            return message.respond(isItDayOfWeek[1] === days[(new Date).getDay()] ? 'Ja det der. Skulle du spørge fra nogen?' : 'Næ :-(')
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
