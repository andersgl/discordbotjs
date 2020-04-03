const Command = require('../command');
const _ = require('lodash')

class Meyer extends Command {

    help() {
        return [
            { trigger: 'meyer start @spiller1 @spiller2 osv..', description: 'Start et meyerspil' },
            { trigger: 'meyer slå', description: 'Slå med terningerne' },
            { trigger: 'meyer meld', description: 'Meld dit slag.' },
            { trigger: 'meyer videre', description: 'Send terningerne videre' },
            { trigger: 'meyer ellerderover', description: 'Du slog noget lort, slå igen uden at se terningerne.' },
            { trigger: 'meyer løft', description: 'Løft og se om du er nab.' },
            { trigger: 'meyer stop', description: 'Stop spille.t' },
        ]
    }

    description() {
        return 'Hold kæft Meyer!'
    }

    init() {
        this.reset()
    }

    process(msg) {
        console.log(msg.action);

        console.log(this.passedRoll);
        console.log(this.currentRoll);
        console.log(this.priorRoll);

        switch (msg.action) {
            case 'help':
                msg.respond(this.showHelp());
                break
            case 'start':
                this.start(msg);
                break
            case 'slå':
                this.roll(msg);
                break;
            case 'meld':
                this.report(msg);
                break;
            case 'videre':
                this.continue(msg);
                break;
            case 'ellerderover':
                this.pass(msg);
                break;
            case 'løft':
                this.lift(msg);
                break;
            case 'stop':
                this.stop(msg);
                break;
            default:
                msg.respond('Hold kæft Meyer!');
                break;
        }
    }

    stop(msg) {
        this.reset();
        msg.respond('Spillet er stoppet.')
    }

    diceRoll() {
        const roll1 = _.random(1, 6);
        const roll2 = _.random(1, 6);

        // const roll1 = 1;
        // const roll2 = 2;

        return [
            roll1, roll2
        ];
    }

    diceRollPretty(diceRoll, prefix = 'Du') {
        const sorted = _.sortBy(diceRoll);

        const dicemap = {
            1: '<:dice1:695645520147775570>',
            2: '<:dice2:695645848100405360>',
            3: '<:dice3:695645874705006684>',
            4: '<:dice4:695645875204260091>',
            5: '<:dice5:695645875074105364>',
            6: '<:dice6:695645874981961769>'
        };

        const dice1 = dicemap[sorted[1]];
        const dice2 = dicemap[sorted[0]];

        // // Check par
        // if (sorted[0] == sorted[1]) {
        //     return prefix + ' slog par ' + sorted[0] + dice1 + dice2;
        // }

        // Check meyer
        // if (sorted[0] == 1 && sorted[1] == 2) {
        //     return prefix + ' slog Meyer! Gratz' + dice1 + dice2;;
        // }

        // // Check lillemeyer
        // if (sorted[0] == 1 && sorted[1] == 3) {
        //     return prefix + ' slog lille Meyer!' + dice1 + dice2;;
        // }

        return prefix + ' slog ' + dice1 + dice2;;
    }

    lift(msg) {
        if (!this.isActive) {
            msg.respond('Spillet er ikke startet.')
            return;
        }

        if (!this.isYourTurn(msg.author)) {
            msg.respond('Det er ikke din tur.');
            return;
        }

        if (this.passedRoll.roll) {
            msg.respond(this.diceRollPretty(this.passedRoll.roll, this.passedRoll.player));
        }

        msg.respond(this.diceRollPretty(this.priorRoll.roll, this.priorRoll.player));
        // better than?
    }

    report(msg) {
        if (!this.isActive) {
            msg.respond('Spillet er ikke startet.')
            return;
        }

        if (!this.isYourTurn(msg.author)) {
            msg.respond('Det er ikke din tur.');
            return;
        }

        if (!this.currentRoll.roll) {
            msg.respond('Du har ikke slået endnu. Brug !meyer slå');
            return;
        }

        if (this.currentRoll.report) {
            msg.respond('Du har allerede meldt. Brug !meyer videre');
            return;
        }

        this.currentRoll.report = msg.args[0];
        this.priorRoll = this.currentRoll;
        this.currentRoll = this.clearRole();
        this.passedRoll = this.clearRole();

        msg.respond('Der er meldt ' + this.priorRoll    .report);

        this.nextRoll(msg);
    }

    continue(msg) {
        if (!this.isActive) {
            msg.respond('Spillet er ikke startet.')
            return;
        }

        if (!this.isYourTurn(msg.author)) {
            msg.respond('Det er ikke din tur.');
            return;
        }

        if (!this.currentRoll.roll) {
            msg.respond('Du har ikke slået endnu. Brug !meyer slå');
            return;
        }

        if (!this.currentRoll.report) {
            msg.respond('Du har ikke meldt endnu. Brug !meyer meld <melding>');
            return;
        }

        this.priorRoll = this.currentRoll;
        this.currentRoll = this.clearRole();
        this.passedRoll = this.clearRole();

        console.log(this.currentRoll);

        this.nextRoll(msg);
    }

    nextRoll(msg) {
        this.currentPlayerIndex = this.currentPlayerIndex + 1;

        var nextPlayer = this.players[this.currentPlayerIndex];

        if (!nextPlayer) {
            nextPlayer = this.players[0];
            this.currentPlayerIndex = 0;
        }

        this.currentRoll.player = nextPlayer;

        msg.respond('Din tur ' + this.currentRoll.player + '!');
    }

    roll(msg) {
        if (!this.isActive) {
            msg.respond(this.diceRollPretty(this.diceRoll()));
            return;
        }

        if (!this.isYourTurn(msg.author)) {
            msg.respond('Det er ikke din tur.');
            return;
        }

        console.log(this.currentRoll);

        if (this.currentRoll.roll) {
            msg.respond('Du har allerede slået. Brug !meyer meld <melding>');
            return;
        }

        this.currentRoll.roll = this.diceRoll();

        msg.dm(msg.author, this.diceRollPretty(this.currentRoll.roll));
    }

    pass(msg) {
        if (!this.isActive) {
            msg.respond(this.diceRollPretty(this.diceRoll()));
            return;
        }

        if (!this.isYourTurn(msg.author)) {
            msg.respond('Det er ikke din tur.');
            return;
        }

        if (!this.currentRoll.roll) {
            msg.respond('Du har ikke slået endnu. Brug !meyer slå');
            return;
        }

        this.passedRoll.roll = this.diceRoll();
        this.passedRoll.report = 'eller derover';
        this.passedRoll.player = msg.author;
        this.currentRoll = this.clearRole();

        this.nextRoll(msg);

        msg.respond('Eller derover!');
    }

    start(msg) {
        if (this.isActive) {
            msg.respond('Spillet er allerede i gang.')
            return;
        }

        const playerArgs = msg.args.length > 0 ? msg.args : null;

        if (!playerArgs) {
            msg.respond('Brug meyer start @spiller1 @spiller2 osv..')
            return;
        }

        playerArgs.forEach(playerArg => {
            let userId = playerArg.replace(/[\\<>@#&!]/g, "");

            msg.mentions.users.forEach(mention => {
                if (mention.id == userId && !mention.bot) {
                    this.players[userId] = mention;
                }
            });
        })

        this.isActive = true;
        this.players = _.shuffle(this.players);
        this.currentRoll.player = this.players[0];
        this.currentPlayerIndex = 0;

        msg.respond('Spillet er igang, ' + this.currentRoll.player + ' begynder.')
    }

    clearRole() {
        return {
            roll: null,
            player: null,
            report: null,
        };
    }

    isYourTurn(user) {
        return user.id == this.currentRoll.player.id;
    }

    reset() {
        this.isActive = false;
        this.priorRoll = this.clearRole();
        this.passedRoll = this.clearRole();
        this.currentRoll = this.clearRole();
        this.currentPlayerIndex = null;
        this.players = {};
    }
}

module.exports = Meyer
