const _ = require('lodash')
const raaRandomizr = require('../utils/raa-randomizer')
const moment = require('moment')

class Lolz {

    constructor() {
        this.randomizr = new raaRandomizr
    }

    message(message) {
        const content = message.content.toLowerCase();
        if (content === 'agge?!') {
            return message.respondTTS(_.fill(Array(5), 'agge').join(' '))
        }

        if (content === '!random') {
            return message.respondTTS(this.randomizr.random(99))
        }

        if (content == 'er det lan?') {
            // const lanDate = moment('2022-03-10T22:00:00').utcOffset(1);
            const lanDate = null;
            if (!lanDate) {
                return message.respond('Nej :cry:');
            }
            const now = moment().utcOffset(1, true);
            if (lanDate.unix() - now.unix() <= 0) {
                return message.respond('Ja! LOLOLLOLOLOLOLOL');
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

        if (content === '!slack') {
            return message.respond('https://tenor.com/view/slacker-lazy-back-to-the-future-gif-15706066');
        }

        if (content === '!inferno-t-pistol-round-winrate') {
            message.respond('https://tenor.com/view/100percent-yes-ace-kpop-kang-yuchan-gif-14798177');
            message.respondTTS('PROCENT');
            return;
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
