const Command = require('../command');
const Roll = require('./roll');
const _ = require('lodash');

class Meyer extends Command {

    help() {
        return [
            { trigger: 'meyer start @spiller1 @spiller2 osv..', description: 'Start et meyerspil' },
            { trigger: 'meyer slå|roll', description: 'Slå med terningerne' },
            { trigger: 'meyer meld', description: 'Meld dit slag.' },
            { trigger: 'meyer videre', description: 'Send terningerne videre' },
            { trigger: 'meyer ellerderover', description: 'Du slog noget lort, slå igen uden at se terningerne.' },
            { trigger: 'meyer løft', description: 'Løft og se om du er nab.' },
            { trigger: 'meyer tur', description: 'Se vis tur det er.' },
            { trigger: 'meyer stop', description: 'Stop spillet' },
        ];
    }

    description() {
        return 'Hold kæft Meyer!';
    }

    init() {
        this.reset();
    }

    process(msg) {
        switch (msg.action) {
            case 'help':
                msg.respond(this.showHelp());
                break;
            case 'start':
                this.start(msg);
                break;
            case 'slå':
            case 'roll':
                this.roll(msg);
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
            case 'tur':
                this.tur(msg);
                break;
            case 'stop':
                this.stop(msg);
                break;
            case 'meld':
                this.report(msg);
                break;
            default:
                msg.respond('Hold kæft Meyer!');
                break;
        }
    }

    start(msg) {
        if (this.isActive) {
            msg.respond('Spillet er allerede i gang.');
            return;
        }

        this.players = msg.mentions.users.filter(mentionUser => !mentionUser.bot).array();
        if (this.players.length === 0) {
            msg.respond('Brug meyer start @spiller1 @spiller2 osv..');
            return;
        }

        this.isActive = true;
        this.players = _.shuffle(this.players);
        this.currentPlayerIndex = 0;
        this.turns = [];
        msg.respond('Spillet er igang, ' + this.currentPlayer + ' begynder.')
    }

    stop(msg) {
        this.reset();
        msg.respond('Spillet er stoppet.')
    }

    roll(msg) {
        if (!this.isActive) {
            this.displayRoll(msg, new Roll());
            return;
        }

        if (!this.isYourTurn(msg.author)) {
            msg.respond('Det er ikke din tur.');
            return;
        }

        if (this.currentRoll.roll) {
            msg.respond('Du har allerede slået. Brug !meyer meld <melding>');
            return;
        }

        this.currentRoll.roll = this.diceRoll();

        msg.dm(msg.author, this.diceRollPretty(this.currentRoll.roll));
    }

    displayRoll(msg, roll) {
        msg.respond(roll.pretty);
        if (roll.special) {
            msg.respond(roll.special);
        }
    }

    tur(msg) {
        if (!this.isActive) {
            msg.respond('Spillet er ikke startet.')
            return;
        }

        msg.respond('Det er ' + this.currentRoll.player);
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

        msg.respond(this.diceRollPretty(this.priorRoll.roll, this.priorRoll.player));
        if (this.passedRoll.roll) {
            msg.respond(this.diceRollPretty(this.passedRoll.roll, this.passedRoll.player));
        }

        const originalReport = this.rollToValue(this.nameToValue(this.priorRoll.report));
        const roll = this.passedRoll.roll ? this.passedRoll : this.priorRoll;
        const lastRoll = this.rollToValue(roll.roll);
        if (lastRoll >= originalReport) {
            msg.respond(roll.player + ' vandt');
            msg.respond('Din tur ' + this.currentRoll.player);
        } else {
            msg.respond(msg.author + ' vandt');
            this.prevRoll(msg);
        }
    }

    rollToValue(rollValue) {
        const values = {
            '11': 71,
            '22': 72,
            '33': 73,
            '44': 74,
            '55': 75,
            '66': 76,
            '31': 80,
            '21': 90,
        };
        const value = _.sortBy(rollValue).join('');

        return values[value] !== undefined ? values[value] : parseInt(value);
    }

    nameToValue(name) {
        const names = {
            par1: [1, 1],
            par2: [2, 2],
            par3: [3, 3],
            par4: [4, 4],
            par5: [5, 5],
            par6: [5, 5],
            lillemeyer: [3, 1],
            meyer: [2, 1],
        };
        if (names[name] !== undefined) {
            return names[name];
        }
        return [parseInt(name[0]), parseInt(name[1])];
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

        this.nextRoll(msg);
    }

    prevRoll(msg) {
        this.currentPlayerIndex = this.currentPlayerIndex - 1 > 0 ? this.currentPlayerIndex - 1 : this.players.length - 1;
        this.currentRoll.player = this.players[this.currentPlayerIndex];
        msg.respond('Din tur ' + this.currentRoll.player + '!');
    }

    nextRoll(msg) {
        this.currentPlayerIndex = this.currentPlayerIndex + 1 < this.players.length ? this.currentPlayerIndex + 1 : 0;
        this.currentRoll.player = this.players[this.currentPlayerIndex];
        msg.respond('Din tur ' + this.currentRoll.player + '!');
    }

    nextRoll22(msg) {
        this.currentPlayerIndex = this.currentPlayerIndex + 1;

        var nextPlayer = this.players[this.currentPlayerIndex];

        if (!nextPlayer) {
            nextPlayer = this.players[0];
            this.currentPlayerIndex = 0;
        }

        this.currentRoll.player = nextPlayer;

        msg.respond('Din tur ' + this.currentRoll.player + '!');
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

    clearRole() {
        return {
            roll: null,
            player: null,
            report: null,
        };
    }

    isYourTurn(user) {
        return user.id == this.currentPlayer.id;
    }

    reset() {
        this.isActive = false;
        this.currentPlayerIndex = null;
        this.players = [];
    }

    get currentPlayer() {
        if (this.currentPlayerIndex === null || !this.players[this.currentPlayerIndex]) {
            console.log('currentPlayer111');
            return null;
        }
        console.log('currentPlayer222');
        return this.players[this.currentPlayerIndex];
    }
}

module.exports = Meyer
