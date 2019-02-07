const Command   = require('../command');
const Discord   = require('discord.js');
const fs        = require('fs');
const demofile  = require('demofile');
const _         = require('lodash');
const crypto    = require('crypto');
const utf8      = require('utf8');
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

        table += `╔═════════════════╦═════╦═════╦═════╦═════╦═════╦═════╦═════╦═════╗\n`;
        table += `║                 ║  K  ║  D  ║  A  ║ +/- ║  HS ║ ADR ║ MVP ║  P  ║\n`;
        table += `╠═════════════════╬═════╬═════╬═════╬═════╬═════╬═════╬═════╬═════╣\n`;

        _.forEach(match, function(data, key) {

            console.log(data.info.name.split("").length);

            var name = utf8.encode(data.info.name);
            //var kk = this.strLength(data.info.name);

            var name = this.wrap(data.info.name, 15);
            var kills = this.wrap(data.stats.kills, 3);
            var deaths = this.wrap(data.stats.deaths, 3);
            var assists = this.wrap(data.stats.assists, 3);
            var assists = this.wrap(data.stats.assists, 3);
            var kd = this.wrap(data.stats.kills - data.stats.deaths, 3);
            var hs = Math.round((data.stats.headShotKills / data.stats.kills) * 100);
            var damage = this.wrap(Math.round(data.stats.damage / 16), 3); // todo: get rounds.
            var mvps = this.wrap(data.stats.mvps, 3);
            var score = this.wrap(data.stats.score, 3);

            //var hs = this.wrap(hs, 3);

            table += `║ ${name} ║ ${kills} ║ ${deaths} ║ ${assists} ║ ${kd} ║ ${hs}% ║ ${damage} ║ ${mvps} ║ ${score} ║\n`;
            table += `╠═════════════════╬═════╬═════╬═════╬═════╬═════╬═════╬═════╬═════╣\n`;
        }.bind(this));

        table += `╚═════════════════╩═════╩═════╩═════╩═════╩═════╩═════╩═════╩═════╝\n`;
        table += '```';

        return table;
    }

 strLength(s) {
  var length = 0;
  while (s[length] !== undefined)
    length++;
  return length;
}

    wrap(str, length, pad = ' ', padDirection = 'right') {
        var theString = new String(str);
        theString = theString.substring(0, length);

        if (length > theString.length) {
            var padString = new Array(length - theString.length + 1).join(pad);
            //console.log(theString + ' = ' + theString.length + ' : ' + padString.length);
            theString = padDirection == 'right' ? theString + padString : padString + theString;
        }

        return theString;
        // l(str);

// function pad(width, string, padding) {
//   return (width <= string.length) ? string : pad(width, padding + string, padding)
// }
// pad(5, 'hi', '0')
// => "000hi"



        // if (padLeft) {
        //     return (pad + str).slice(-pad.length);
        // } else {
        //     return (str + pad).substring(0, pad.length);
        // }
    }

    processDemo(msg) {
        // https://www.tablesgenerator.com/text_tables

//         let table = '```';
//         table += `
// ╔═════════════════╦═════╦═════╦═════╦═════╦═════╦═════╦═════╦═════╗
// ║                 ║  K  ║  D  ║  A  ║ +/- ║  HS ║ ADR ║ MVP ║  P  ║
// ╠═════════════════╬═════╬═════╬═════╬═════╬═════╬═════╬═════╬═════╣
// ║ DevilsAngelxxxx ║ xxx ║ xxx ║ xxx ║  xx ║ xx% ║ xxx ║  xx ║ xxx ║
// ╠═════════════════╬═════╬═════╬═════╬═════╬═════╬═════╬═════╬═════╣
// ║                 ║     ║     ║     ║     ║     ║     ║     ║     ║
// ╠═════════════════╬═════╬═════╬═════╬═════╬═════╬═════╬═════╬═════╣
// ║                 ║     ║     ║     ║     ║     ║     ║     ║     ║
// ╠═════════════════╬═════╬═════╬═════╬═════╬═════╬═════╬═════╬═════╣
// ║                 ║     ║     ║     ║     ║     ║     ║     ║     ║
// ╚═════════════════╩═════╩═════╩═════╩═════╩═════╩═════╩═════╩═════╝`;
//         table += '```';

//         // let embed = new Discord.RichEmbed()
//         //                 .setColor('0xff8000')
//         //                 .addField('Some match title', '\u200B')
//         //                 .addField('Stats', table);

//         msg.respond(table);

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
                        if (!_.has(totals, player.userId)) {
                            console.log('create player!!');
                            totals[player.userId] = {
                                info: player.userInfo,
                                stats: {
                                    kills: player.kills,
                                    deaths: player.deaths,
                                    assists: player.assists,
                                    mvps: player.mvps,
                                    headShotKills: 0,
                                    damage: 0,
                                    score: player.score
                                }
                            };
                        }

                        // Collect pr. round stats
                        _.forEach(player.matchStats, function(stat) {
                            totals[player.userId].stats.headShotKills += stat.headShotKills;
                            totals[player.userId].stats.damage += stat.damage;
                        });
                    });

                    this.setDemoTotals(totals);
                }
            });

            demoFile.on('start', e => {
                console.log('Running demo...');
            });

            demoFile.on('end', e => {
                console.log('Demo run done...');
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
