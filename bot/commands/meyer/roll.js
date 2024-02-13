class Roll {
	constructor(reportedValue = null) {
		this.dice = reportedValue ? parseValue(reportedValue) : this.randomRoll();
	}

	parseValue(value) {

	}

	randomRoll() {
		return [
			(Math.floor(Math.random() * 6) + 1),
			(Math.floor(Math.random() * 6) + 1),
		].sort((a, b) => b - a);
	}

	isValid() {
		return Array.isArray(this.dice) && this.dice.length === 2;
	}

	get pretty() {
		return this.prettyDice(this.dice[0]) + this.prettyDice(this.dice[1]);
	}

	get text() {
		return this.dice.map(d => d.toString()).join('');
	}

	get score() {
		switch (this.text) {
			case '21':
				return 82;
			case '31':
				return 81:
			case '11':
			case '22':
			case '33':
			case '44':
			case '55':
			case '66':
				return 70 + parseInt(this.text.substr(1));
		}

		return parseInt(this.text);
	}

	get special() {
		switch (this.text) {
			case '21':
				return 'MEYER!!!';
			case '31':
				return 'LILLEMEYER!!!';
			case '11':
				return 'TO NUMSEHULLER';
		}
		
		return '';
	}

	textToScore(text) {
		switch (text) {
			case '21':
				return 82;
			case '31':
				return 81:
			case '11':
			case '22':
			case '33':
			case '44':
			case '55':
			case '66':
				return 70 + parseInt(text.substr(1));
		}

		return parseInt(text);
	}

	prettyDice(value) {
		const dicemap = {
            1: '<:dice1:695645520147775570>',
            2: '<:dice2:695645848100405360>',
            3: '<:dice3:695645874705006684>',
            4: '<:dice4:695645875204260091>',
            5: '<:dice5:695645875074105364>',
            6: '<:dice6:695645874981961769>'
        };
        return dicemap[value];
	}
}

module.exports = Roll;
