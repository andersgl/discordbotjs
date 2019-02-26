const Command   = require('../command');
const Discord   = require('discord.js');
const fs        = require('fs');
const demofile  = require('demofile');
const _         = require('lodash');
const crypto    = require('crypto');
const utf8      = require('utf8');
const url       = require('url');
const path      = require('path');
const http      = require('http');
const decompress = require('decompress');
const decompressBzip2 = require('decompress-bzip2');
const decompressUnzip = require('decompress-unzip');
//const Table     = require('cli-table3');
//const download  = require('download');
//const decompressGz = require('decompress-gz');

class Demo extends Command {
    init() {
        this.demoTotals = [];
        this.matches = this.loadMatches();
        this.processing = false;
    }

    triggers() {
        return ['demo']
    }

    help() {
        return [
            { trigger: 'demo <url>', description: 'Upload a GOTV demo and get the stats. (..dem.bz2)' }
        ]
    }

    process(msg) {
        if (!msg.action) {
            msg.respond(this.showHelp());
            return;
        }

        switch (msg.trigger) {
            case 'demo':
                if (!msg.action) {
                    msg.respond('No demo provided.');
                    return;
                }

                if (this.processing) {
                    msg.respond('Please wait for other demo to finish...');
                    return;
                }

                this.processDemo(msg);
            break;
        }
    }

    getHash(demoFile){
        return crypto.createHash('md5').update(this.path(demoFile)).digest('hex').substr(2, 9);
    }

    l(s) {
        console.log(s);
    }

    getMatchTable(hash) {
        if (!_.has(this.matches, hash)) {
            return 'I couldn\'t find anything for that match.';
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
            //console.log(data.info.name.split("").length);
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
            var mvps = this.wrap(data.stats.mvps + '★', 3);
            var score = this.wrap(data.stats.score, 3);

            //var hs = this.wrap(hs, 3);

            table += `║ ${name} ║ ${kills} ║ ${deaths} ║ ${assists} ║ ${kd} ║ ${hs}% ║ ${damage} ║ ${mvps} ║ ${score} ║\n`;
            table += `╠═════════════════╬═════╬═════╬═════╬═════╬═════╬═════╬═════╬═════╣\n`;
        }.bind(this));

        table += `╚═════════════════╩═════╩═════╩═════╩═════╩═════╩═════╩═════╩═════╝\n`;
        table += '```';

        return table;
    }

    //  strLength(s) {
    //   var length = 0;
    //   while (s[length] !== undefined)
    //     length++;
    //   return length;
    // }

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

        // _download(url, dest, cb) {
        //   var file = fs.createWriteStream(dest);
        //   var request = http.get(url, function(response) {
        //     response.pipe(file);
        //     file.on('finish', function() {
        //       file.close(cb);  // close() is async, call cb after close completes.
        //       return true;
        //     });
        //   }).on('error', function(err) { // Handle errors
        //     fs.unlink(dest); // Delete the file async. (But we don't check the result)
        //     if (cb) cb(err.message);
        //     return false;
        //   });
        // };

    downloadAndDecompressDemo(url, dest, filename){
        var file = fs.createWriteStream(dest);

        return new Promise((resolve, reject) => {
            http.get(url, response => {
                response.pipe(file);
                file.on('finish', () =>{
                    file.close(() => {

                        var ext = path.extname(url);

                        switch (ext) {
                            case '.bz2':
                                decompress(dest, this.path('/demos'), {
                                    plugins: [
                                        decompressBzip2({path: filename})
                                    ]
                                }).then(files => {
                                    fs.chmodSync(this.path('/demos/') + filename, '755');
                                    resolve();
                                });
                            break;
                            default:
                                this.processing = false;
                                reject();
                            break;
                            // case '.rar':
                            //     decompress(dest, this.path('/demos'), {
                            //         plugins: [
                            //             decompressUnzip()
                            //         ]
                            //     }).then(files => {
                            //         console.log('Files decompressed');
                            //         console.log(files);
                            //         fs.chmodSync(this.path('/demos/') + filename, '755');
                            //         resolve();
                            //     });
                            // break;
                        }
                    });
                });
            }).on('error', err => {
                this.processing = false;
                reject(err);
            });
        });
    }

    nobz2(str) {
        return str.replace('.bz2', '');
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
//         msg.respond(table);

        // http://replay181.valve.net/730/003327493294446870689_1736776251.dem.bz2
        var demoFilePath = msg.action;
        var demoFileParsed = url.parse(demoFilePath);
        var demoFileName = path.basename(demoFileParsed.pathname);
        var hash = this.getHash(demoFilePath);

        if (_.has(this.matches, hash)) {
            msg.respond(this.getMatchTable(hash));
            return;
        }

        this.processing = true;

        msg.respond('Please wait while I process the demo.');

        var tmpDemoPath = this.path('demos/') + demoFileName;
        if (!fs.existsSync(this.path('demos/'))) {
            fs.mkdirSync(this.path('demos/'));
        }

        this.downloadAndDecompressDemo(demoFilePath, tmpDemoPath, this.nobz2(demoFileName))
            .then( () => {
                //console.log('processing complete');
                this.processDemoData(this.nobz2(tmpDemoPath), hash, msg);
            })
            .catch( e => {
                console.error('download error', e);
                msg.respond('That doesn\'t look like a valid demo file.');
            });
    }

    processDemoData(demoPath, hash, msg) {
        fs.readFile(demoPath, (err, buffer) => {
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
                //msg.respond('Please wait while I process the demo.');
            });

            demoFile.on('end', e => {
                this.processDemoTotals(hash);
                this.processing = false;
                msg.respond('All done, here\'s the results for the match ('+hash+')\n' + this.getMatchTable(hash));
            });

            demoFile.parse(buffer);
        });
    }

    setDemoTotals(totals) {
        this.demoTotals = totals;
    }

    processDemoTotals(hash) {
        this.matches[hash] = this.demoTotals;
        this.saveMatches();
    }

    path(filename = '') {
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
            return require(this.path(file));
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

module.exports = Demo
