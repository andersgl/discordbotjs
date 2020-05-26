class RaaRandomizer {
    constructor() {
        this.members = [
            'pede', 'nuller', 'cawer', 'ralla', 'launie', 'agge', 'raaturbo', 'julemanden', 'carlos',
            'darth', 'whitesnake',
        ]

        this.prefixes = [
            'baiter', 'aids', 'lol', 'tard', 'nab', 'pleb', 'lo2', 'chet', 'ruski', 'clutch', '1337', 'kong', 'lækker', 'skilled',
        ]
    }
    
    random(maxNumber = 999) {
        const prefix = this.prefixes[Math.floor(Math.random() * this.prefixes.length)]
        const member = this.members[Math.floor(Math.random() * this.members.length)]
        const random = Math.floor(Math.random() * maxNumber) + 0
        return [prefix, member, (random < 10 ? '0' : '') + random.toString()].join('-')
    }
}

module.exports = RaaRandomizer