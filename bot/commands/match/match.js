const fs = require('fs')
const moment = require('moment')
const Discord = require('discord.js')
const _ = require('lodash')
const Command = require('../command')
const jsonStorage = require('../../storage/json')

class Match extends Command {

    help() {
        return [
            { trigger: 'match', description: 'Show upcoming matches' },
            { trigger: 'match archive', description: 'Show previous matches + results' },
            { trigger: 'match yes <hash>', description: 'Sign up for a match' },
            { trigger: 'match no <hash>', description: '"I (pretend to) have better stuff to do"' },
            { trigger: 'match add <datetime> <opponent>', description: 'Add a new match (datetime format: 2019-02-02T20:00)' },
            { trigger: 'match remove <hash>', description: 'Remove a match' },
            { trigger: 'match move <hash> <datetime>', description: 'Move a match to a new time (format: 2019-02-02T20:00)' },
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
                this.matchesOverview(prevMatches).forEach(embed => {
                    msg.respond(embed)
                })
                break

            case 'help':
                msg.respond(this.showHelp())
                break
            
            default:
                const futureMatches = this.futureMatches()
                if (!futureMatches.length) {
                    return msg.respond('No future matches found')
                }
                this.matchesOverview(futureMatches).forEach(embed => {
                    msg.respond(embed)
                })
                break
        }
    }

    matchesOverview(matches = []) {
        return _.orderBy(matches, ['date'], ['asc']).map(match => {
            if (match.date < moment().unix()) {
                return this.resultMatchEmbed(match)
            }
            return this.futureMatchEmbed(match)
        })
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
            id: this.randomId(),
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
        return this.jsonStorage.save('matches', matches)
    }

    loadMatches() {
        return this.jsonStorage.load('matches', [])
    }

    futureMatches() {
        return this.loadMatches().filter(match => match.date >= moment().unix())
    }

    previousMatches() {
        return this.loadMatches().filter(match => match.date < moment().unix())
    }

    formatDate(date) {
        return moment.unix(date).format('YYYY-MM-DD HH:mm')
    }

    randomId(length = 8) {
        return Math.random().toString(36).substr(2, length)
    }
}

module.exports = Match
