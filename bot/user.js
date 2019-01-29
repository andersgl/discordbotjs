class User {
    constructor(author, adminIds = []) {
        if (!Array.isArray(adminIds)) {
            adminIds = []
        }
        this.id = author.id
        this.username = author.username
        this.admin = adminIds.indexOf(author.id) >= 0
    }
}

module.exports = User
