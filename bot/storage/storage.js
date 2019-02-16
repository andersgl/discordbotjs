const path = require('path')
const fs = require('fs')

class Storage {
    path(filePath) {
        return process.cwd() + '/storage/json/' + filePath
    }

    folderName(filePath) {
        return path.dirname(filePath)
    }

    folderCheck(filePath) {
        if (!fs.existsSync(this.folderName(filePath))) {
            fs.mkdirSync(this.folderName(filePath))
        }
    }
}

module.exports = Storage
