class Dice {
	constructor(value = null) {
		if (value !== null) {
			this.value = parseInt(value) !== NaN ? parseInt(value) : null;
		} else {
			this.roll();
		}
	}

	isValid() {
		return typeof this.value === 'number' && this.value >= 1 && this.value <= 6;
	}

	roll() {
		this.value = Math.floor(Math.random() * 6) + 1;
	}

	get text() {
		if (!this.isValid()) {
			return '';
		}
		return this.value.toString();
	}

	get emoji() {
		if (!this.isValid()) {
			return '';
		}
		const emojiMap = {
            1: '<:dice1:695645520147775570>',
            2: '<:dice2:695645848100405360>',
            3: '<:dice3:695645874705006684>',
            4: '<:dice4:695645875204260091>',
            5: '<:dice5:695645875074105364>',
            6: '<:dice6:695645874981961769>'
        };
        return emojiMap[this.value];
	}
}

module.exports = Dice;
