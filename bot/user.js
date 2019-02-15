class User {
    constructor(author, config = []) {
        if (!Array.isArray(config.admins)) {
            admins = [];
        }
        this.id = author.id;
        this.username = author.username;
        this.admin = config.admins.indexOf(author.id) >= 0;
    }
}

module.exports = User
