const Command   = require('../command');
const Discord   = require('discord.js');
const fs        = require('fs');
const demofile  = require('demofile');
const _         = require('lodash');
const crypto    = require('crypto');
//const Table     = require('cli-table3');

class Stat extends Command {
    init() {
        this.demoTotals = [];
        this.matches = this.loadMatches();
    }

    triggers() {
        return ['stat', 'd']
    }

    help() {
        return [
            { trigger: 'stat', description: 'fubar' },
            { trigger: 'd', description: 'fubar' }
        ]
    }

    process(msg) {
        switch (msg.trigger) {
            case 'stat':
                this.k(msg)
            break
            case 'd':
                this.processDemo(msg);
            break;
        }
    }

    getHash(demoFile){
        return crypto.createHash('md5').update(this.path(demoFile)).digest('hex');
    }

    l(s) {
        console.log(s);
    }

    getMatchTable(hash) {
        if (!_.has(this.matches, hash)) {
            return 'Kunne ikke finde de data.';
        }

        // const statsTable = new Table({
        //     head: ['Rel', 'Change', 'By', 'When'],
        //     colWidths: [6, 21, 25, 17],
        //     // chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
        //     //         , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
        //     //         , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
        //     //         , 'right': '' , 'right-mid': '' , 'middle': ' ' },
        //     // chars: {
        //     //     'top': '═',
        //     //     'top-mid': '╦',
        //     //     'top-left': '╔',
        //     //     'top-right': '╗',
        //     //     'bottom': '═',
        //     //     'bottom-mid': '╩',
        //     //     'bottom-left': '╚',
        //     //     'bottom-right': '╝',
        //     //     'left': '║',
        //     //     'left-mid': '╠',
        //     //     'mid': '═',
        //     //     'mid-mid': '╬',
        //     //     'right': '║',
        //     //     'right-mid': '╣',
        //     //     'middle': '║'
        //     // }
        // });

        // statsTable.push(
        //     ['v0.1', 'Testing something cool', 'rauchg@gmail.com', '7 minutes ago'],
        //     ['v0.1', 'Testing something cool', 'rauchg@gmail.com', '8 minutes ago']
        // );
        // this.l(statsTable.toString());

        // return statsTable.toString();

        // return '```' + statsTable.toString() + '```';

        var match = _.get(this.matches, hash);

        let table = '```';

        table += `╔═════════════╦═══╦═══╦═══╦═════╦════╦═════╦═════╦═══╗\n`;

        _.forEach(match, function(data) {
            table += `║ Ralla       ║ 4 ║ 1 ║ 0 ║  3  ║  1 ║  1  ║  1  ║ 2 ║\n`;
        });

        table += `╚═════════════╩═══╩═══╩═══╩═════╩════╩═════╩═════╩═══╝\n`;
        table += '```';

        return table;
    }

    processDemo(msg) {
        // https://www.tablesgenerator.com/text_tables

//         let table = '```';
//         table += `
// ╔═════════════╦═══╦═══╦═══╦═════╦════╦═════╦═════╦═══╗
// ║             ║ K ║ D ║ A ║ +/- ║ HS ║ ADR ║ MVP ║ P ║
// ╠═════════════╬═══╬═══╬═══╬═════╬════╬═════╬═════╬═══╣
// ║ Ralla       ║ 4 ║ 1 ║ 0 ║  3  ║  1 ║  1  ║  1  ║ 2 ║
// ╠═════════════╬═══╬═══╬═══╬═════╬════╬═════╬═════╬═══╣
// ║ DevilsAngel ║ 1 ║ 1 ║ 0 ║  0  ║  1 ║  1  ║  0  ║ 1 ║
// ╠═════════════╬═══╬═══╬═══╬═════╬════╬═════╬═════╬═══╣
// ║             ║   ║   ║   ║     ║    ║     ║     ║   ║
// ╠═════════════╬═══╬═══╬═══╬═════╬════╬═════╬═════╬═══╣
// ║             ║   ║   ║   ║     ║    ║     ║     ║   ║
// ╚═════════════╩═══╩═══╩═══╩═════╩════╩═════╩═════╩═══╝`;
//         table += '```';

        // let embed = new Discord.RichEmbed()
        //                 .setColor('0xff8000')
        //                 .addField('Some match title', '\u200B')
        //                 .addField('Stats', table);

        // msg.respond(table);

        var demoFileName = 'test.dem';
        var hash = this.getHash(demoFileName);

        if (_.has(this.matches, hash)) {
            this.l('This demo has already been processed.');
            msg.respond(this.getMatchTable(hash));
            return;
        }

        fs.readFile(this.path(demoFileName), (err, buffer) => {
            const demoFile = new demofile.DemoFile();

            demoFile.entities.on('change', e => {
                if (e.tableName != 'DT_CSGameRules' && e.varName != 'm_gamePhase') {
                    return;
                }

                // Game over.
                if (e.newValue == 5) {
                    const roundCount = demoFile.gameRules.roundsPlayed;
                    const teams = demoFile.teams;
                    const terrorists = teams[2];
                    const cts = teams[3];
                    var allPlayers = _.concat(terrorists.members, cts.members);
                    var totals = {};

                    _.forEach(allPlayers, function(player) {
                        if (!totals[player.steamId]) {
                            totals[player.steamId] = {
                                kills: player.kills,
                                deaths: player.deaths,
                                assists: player.assists,
                                mvps: player.mvps,
                                headShotKills: 0,
                                damage: 0,
                                score: player.score
                            };
                        }

                        // Collect pr. round stats
                        _.forEach(player.matchStats, function(stat) {
                            totals[player.steamId].headShotKills += stat.headShotKills;
                            totals[player.steamId].damage += stat.damage;
                        });
                    });

                    this.setDemoTotals(totals);
                }
            });

            demoFile.on('start', e => {
                console.log('Running demo...');
            });

            demoFile.on('end', e => {
                console.log('Done');
                this.processDemoTotals(hash);
            });

            demoFile.parse(buffer);
        });
    }

    setDemoTotals(totals) {
        this.demoTotals = totals;
    }

    processDemoTotals(hash) {
        console.log(hash, this.demoTotals);
        this.matches[hash] = this.demoTotals;
        this.saveMatches();
    }

    path(filename) {
        return __dirname + '/' + filename
    }

    saveMatches() {
        this.saveData(this.matches, 'matches.json');
    }

    loadMatches() {
        return this.loadData('matches.json');
    }

    saveData(data, file) {
        try {
            fs.writeFile(this.path(file), JSON.stringify(data), 'utf8', () => {})
        } catch (error) {
            console.log('could not save ' + file);
        }
    }

    loadData(file) {
        try {
            return require(this.path(file))
        } catch (error) {
            console.log('could not load ' + file);
            return {}
        }
    }

    // async k(msg) {
    //     if (!msg.user.admin) {
    //         msg.respond('Beklager, du er ikke admin');
    //         return;
    //     }

    //     msg.dm(msg.msg.author, 'Indtast spillere');

    //     //const filter = msg.msg.content.startsWith('!k');

    //     await msg.msg.channel.awaitMessages(message => {
    //         if (message.author.bot) {
    //             console.log('is bot');
    //             return;
    //         }

    //         const parts = message.content.substring(1).split(' ');
    //         var trigger = parts.shift().toLowerCase()
    //         var args = parts;

    //         console.log(trigger);
    //         console.log(args);

    //         switch (trigger) {
    //             case 'spillere':
    //                 msg.dm(msg.msg.author, 'spillere:');

    //                 this.stat['mo'] = {
    //                     'kills': 1
    //                 };

    //                 // console.log(args);
    //             break;
    //             case 'spiller':
    //                 // console.log('spiller:');
    //                 // console.log(args);
    //             break;
    //             case 'save':
    //                 this.data['new_stat'] = this.stat;
    //                 this.saveData();
    //             break;
    //             default:
    //                 msg.dm(message.author, 'Det fattede jeg ikke');
    //         }

    //         console.log(this.stat);
    //     })
    // }
}

module.exports = Stat
