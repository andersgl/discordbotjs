const fs = require('fs')
const moment = require('moment')
const Storage = require('./storage')

class Json extends Storage {

    load(filename, defaultJson = []) {
        try {
            return require(this.path(filename + '.json'))
        } catch (error) {
            return defaultJson
        }
    }

    save(filename, data) {
        try {
            const tmpFile = this.path(filename + (new Date().getTime()) + '.json')
            fs.copyFile(this.path(filename + '.json'), tmpFile, (cpErr) => {
                fs.writeFile(this.path(filename + '.json'), JSON.stringify(data), 'utf8', (wErr) => {
                    if (!wErr) {
                        fs.unlink(tmpFile, (dErr) => { })
                    }
                })
            })
            return true
        } catch (error) {
            return false
        }
    }

}

module.exports = Json
