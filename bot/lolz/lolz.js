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
            const lanDate = moment('2020-11-13T00:00:00').utcOffset(1);
            if (!lanDate) {
                return message.respond('Nej, der er lang tid til lan');
            }
            const now = moment().utcOffset(1);
            if (lanDate.unix() - now.unix() <= 0) {
                return message.respond('JA! https://tenor.com/view/computer-fire-computer-on-fire-fire-computer-gif-12007576');
            }

            const duration = moment.duration(lanDate.diff(now));
            const units = [
                { key: 'months', single: 'måned', plural: 'måneder' },
                { key: 'days', single: 'dag', plural: 'dage' },
                { key: 'hours', single: 'time', plural: 'timer' },
                { key: 'minutes', single: 'minut', plural: 'minutter' },
                { key: 'seconds', single: 'sekund', plural: 'sekunder' },
            ];
            const unitDiffs = units.map(unit => {
                const value = duration.get(unit.key);
                if (!value) {
                    return false;
                }
                return value + ' ' + (value > 1 ? unit.plural : unit.single);
            }).filter(value => value !== false).join(', ');
            return message.respond(`Nej, der er ${unitDiffs} til lan`);
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
