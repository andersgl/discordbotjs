const moment = require('moment')
const Discord = require('discord.js')
const _ = require('lodash')
const Command = require('../command')
const jsonStorage = require('../../storage/json')
const hri = require('human-readable-ids').hri

class Match extends Command {

    help() {
        return [
            { trigger: 'match', description: 'Show upcoming matches' },
            { trigger: 'match archive <limit?>', description: 'Show previous matches + results' },
            { trigger: 'match next <count>', description: 'Show next match(es)' },
            { trigger: 'match yes <hash>', description: 'Sign up for a match' },
            { trigger: 'match no <hash>', description: '"I (pretend to) have better stuff to do"' },
            { trigger: 'match add <datetime> <opponent>', description: 'Add a new match (datetime format: 2019-02-02T20:00)' },
            { trigger: 'match remove <hash>', description: 'Remove a match' },
            { trigger: 'match move <hash> <datetime>', description: 'Move a match to a new time (format: 2019-02-02T20:00)' },
            { trigger: 'match reset <hash>', description: 'Reset player signups for the match' },
            { trigger: 'match result <hash> <result>', description: 'Set a result for a played match' },
            { trigger: 'match maps <hash> <maps>', description: 'Set map(s) for the maps' },
        ]
    }

    description() {
        return 'Sign up for and manage matches'
    }

    init() {
        this.jsonStorage = new jsonStorage()
    }

    process(msg) {
        switch (msg.action) {
            case 'yes':
            case 'no':
                const partMatch = this.updateParticipation(msg.args[0], msg.action, msg.user)
                if (partMatch) {
                    msg.respond('You said ' + msg.action + ' to match ' + msg.args[0])
                }
                break
            
            case 'result':
                const result = this.setMatchResult(msg.args[0], msg.args[1])
                if (result && result.valid) {
                    if (result.won()) {
                        msg.respond('Result updated. Congratz with the win!')
                    } else if (result.lost()) {
                        msg.respond('Result updated. BOOOOOOOO, you suck!')
                    } else {
                        msg.respond('Result updated. Boooooring!')
                    }
                }
                break

            case 'maps':
                if (this.setMatchMaps(msg.args[0], msg.args[1].split(','))) {
                    msg.respond('Updated match maps')
                }
                break

            case 'move':
                if (this.moveMatch(msg.args[0], msg.args[1])) {
                    msg.respond('The match has been moved')
                    msg.respond(this.futureMatchEmbed(this.getMatch(msg.args[0])))
                }
                break

            case 'reset':
                if (this.resetMatch(msg.args[0])) {
                    msg.respond('Signups for the match has been reset')
                    msg.respond(this.futureMatchEmbed(this.getMatch(msg.args[0])))
                }
                break
            
            case 'add':
                if (msg.args.length < 2) {
                    return msg.respond('You need to specity both datetime and opponent')
                }
                const newMatch = this.addMatch(msg.args[0], msg.args.slice(1).join(' '))
                if (newMatch) {
                    msg.respond('Added match:')
                    msg.respond(this.futureMatchEmbed(newMatch))
                }
                break
            
            case 'remove':
                if (this.removeMatch(msg.args[0])) {
                    msg.respond('Removed match with ID ' + msg.args[0])
                }
                break
            
            case 'archive':
                const prevMatches = this.previousMatches()
                if (!prevMatches.length) {
                    return msg.respond('No previous matches found')
                }
                if (msg.args.length && parseInt(msg.args[0])) {
                    msg.sendEmbeds(this.matchesOverview(_.take(prevMatches, parseInt(msg.args[0]))))
                } else {
                    msg.sendEmbeds(this.matchesOverview(prevMatches))
                }
                break

            case 'help':
                msg.respond(this.showHelp())
                break

            case 'next':
                const nextMatches = this.futureMatches()
                if (!nextMatches.length) {
                    return msg.respond('No future matches found')
                }
                msg.sendEmbeds(
                    this.matchesOverview(
                        _.take(nextMatches, (msg.args.length && parseInt(msg.args[0]) ? parseInt(msg.args[0]) : 1))
                    )
                )
                break
            
            default:
                if (msg.action) {
                    return msg.respond('Unknown action: ' + msg.action)
                }
                const futureMatches = this.futureMatches()
                if (!futureMatches.length) {
                    return msg.respond('No future matches found')
                }
                msg.sendEmbeds(this.matchesOverview(futureMatches))
                break
        }
    }

    matchesOverview(matches = []) {
        if (matches.length === 1) {
            return matches[0].date < moment().unix() ? this.resultMatchEmbed(matches[0]) : this.futureMatchEmbed(matches[0])
        }
        return this.multipleMatchesEmbed(matches)
    }

    updateParticipation(id, choice, user) {
        let match = this.getMatch(id)
        if (!match) {
            this.msg.respond('Could not find match with ID ' + id)
            return false
        }

        const updated = moment().unix()
        let playerIndex = match.players.findIndex(player => player.id === user.id)
        if (playerIndex >= 0) {
            match.players[playerIndex].choice = choice
            match.players[playerIndex].updated = updated
        } else {
            match.players.push({
                id: user.id,
                username: user.username,
                choice: choice,
                updated: updated
            })
        }
        
        if (!this.updateMatch(id, match)) {
            return false
        }
        return match
    }

    setMatchResult(id, resultTxt) {
        let match = this.getMatch(id)
        if (!match) {
            this.msg.respond('Could not find match with ID ' + id)
            return null
        }
        const result = this.parseResult(resultTxt)
        if (!result.valid) {
            this.msg.respond('Invalid result format. E.g. 16-7')
            return null
        }
        match.result = resultTxt
        if (!this.updateMatch(id, match)) {
            return null
        }
        return result
    }

    setMatchMaps(id, maps = []) {
        if (!Array.isArray(maps)) {
            maps = []
        }
        let match = this.getMatch(id)
        if (!match) {
            this.msg.respond('Could not find match with ID ' + id)
            return false
        }
        match.maps = maps.map(map => map.trim())
        return this.updateMatch(id, match)
    }

    moveMatch(id, dateInput) {
        let match = this.getMatch(id)
        if (!match) {
            this.msg.respond('Could not find match with ID ' + id)
            return false
        }
        const date = moment(dateInput)
        if (!date.isValid()) {
            this.msg.respond('Invalid date format. Recommended format: 2019-02-02T20:00')
            return false
        }
        match.date = date.unix()
        return this.updateMatch(id, match)
    }

    resetMatch(id) {
        let match = this.getMatch(id)
        if (!match) {
            this.msg.respond('Could not find match with ID ' + id)
            return false
        }
        match.players = []
        return this.updateMatch(id, match)
    }

    addMatch(dateInput, opponent) {
        const date = moment(dateInput)
        if (!date.isValid()) {
            this.msg.respond('Invalid date format. Recommended format: 2019-02-02T20:00')
            return null
        }
        const matches = this.loadMatches()
        const match = this.newMatch(date, opponent)
        matches.push(match)
        this.saveMatches(matches)
        return match
    }

    updateMatch(id, match) {
        const matches = this.loadMatches()
        const index = matches.findIndex(match => match.id === id)
        if (index == -1) {
            return false
        }
        matches[index] = match
        this.saveMatches(matches)
        return true
    }

    removeMatch(id) {
        const matches = this.loadMatches()
        if (matches.filter(match => match.id === id).length === 0) {
            this.msg.respond('Could not find match with ID ' + id)
            return false
        }
        this.saveMatches(matches.filter(match => match.id !== id))
        return true
    }

    newMatch(date = moment(), opponent = '', maps = []) {
        return {
            id: hri.random(),
            date: date.unix(),
            opponent: opponent,
            maps: maps,
            players: [],
            note: '',
            result: null
        }
    }

    getMatch(id) {
        return this.loadMatches().find(match => match.id === id)
    }

    multipleMatchesEmbed(matches) {
        const embeds = []
        _.chunk(matches, 5).forEach(matchChunk => {
            const embed = new Discord.RichEmbed().setColor('0xffffff')

            matchChunk.forEach((match, index) => {
                const yes = match.players.filter(player => player.choice === 'yes')
                const no = match.players.filter(player => player.choice === 'no')
                const result = this.parseResult(match.result)
                embed.addField(
                    this.formatDate(match.date) + ' vs. ' + match.opponent.toUpperCase() + ' (' + match.id + ')',
                    'Lineup: ' + (yes.length ? yes.map(player => player.username).join(', ') : 'None')
                )
                embed.addField('No', no.length ? no.map(player => player.username).join(', ') : 'None', true)
                embed.addField('Maps', match.maps.length ? match.maps.join(', ') : '?', true)
                embed.addField('Result', match.result, true)
                if ((index+1) < matchChunk.length) {
                    embed.addBlankField()
                }
            })
            embeds.push(embed)
        })
        return embeds
    }

    futureMatchEmbed(match) {
        const embed = new Discord.RichEmbed().setColor('0x0000ff')
        const yes = match.players.filter(player => player.choice === 'yes')
        const no = match.players.filter(player => player.choice === 'no')
        embed.setTitle(this.formatDate(match.date) + ' vs. ' + match.opponent.toUpperCase() + ' (' + match.id + ')')
            .addField('Yes', yes.length ? yes.map(player => player.username).join(', ') : 'None')
            .addField('No', no.length ? no.map(player => player.username).join(', ') : 'None')
            .setFooter('Help: !match <yes/no> ' + match.id)

        if (match.maps.length) {
            embed.setDescription('@ ' + match.maps.join(', '))
        }
        if (match.note !== undefined && match.note) {
            embed.addField('Note', match.note)
        }
        
        return embed
    }

    resultMatchEmbed(match) {
        const result = this.parseResult(match.result)
        let color = '666666'
        if (result.valid) {
            color = result.won() ? '008000' : (result.lost() ? 'ff0000' : 'ffa500')
        }
        const embed = new Discord.RichEmbed().setColor('0x' + color)
        const yes = match.players.filter(player => player.choice === 'yes')
        embed.setTitle(this.formatDate(match.date) + ' vs. ' + match.opponent.toUpperCase() + ' (' + match.id + ')')
            .addField('Players', yes.length ? yes.map(player => player.username).join(', ') : 'None')

        if (match.maps.length) {
            embed.setDescription('@ ' + match.maps.join(', '))
        }
        if (match.note !== undefined && match.note) {
            embed.addField('Note', match.note)
        }
        if (result.valid) {
            embed.addField('Result', match.result)
        } else {
            embed.addField('Result', '? - ?')
            embed.setFooter('Help: !match result ' + match.id + ' <result>')
        }
        return embed
    }

    parseResult(resultTxt) {
        let result = {
            valid: false,
            us: 0,
            them: 0,
            won: function () { return this.us > this.them },
            lost: function () { return this.us < this.them },
            tied: function () { return this.us === this.them }
        }
        if (resultTxt) {
            const values = resultTxt.split('-')
            if (values.length === 2) {
                result.valid = true
                result.us = parseInt(values[0].trim())
                result.them = parseInt(values[1].trim())
            }
        }
        return result
    }

    saveMatches(matches) {
        return this.jsonStorage.save('match/matches.json', matches)
    }

    loadMatches() {
        return this.jsonStorage.load('match/matches', [])
    }

    futureMatches() {
        return this.sortMatches(this.loadMatches().filter(match => match.date >= moment().unix()), 'asc')
    }

    previousMatches() {
        return this.sortMatches(this.loadMatches().filter(match => match.date < moment().unix()), 'desc')
    }

    sortMatches(matches = [], direction = 'asc') {
        return _.orderBy(matches, ['date'], [direction])
    }

    formatDate(date) {
        return moment.unix(date).format('YYYY-MM-DD HH:mm')
    }
}

module.exports = Match
