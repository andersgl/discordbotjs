const fs = require('fs')
const path = require('path')
const moment = require('moment')
const Storage = require('./storage')

class Json extends Storage {

    load(filebase, defaultJson = []) {
        try {
            return require(this.fileBase(this.path(filebase)) + '.json')
        } catch (error) {
            return defaultJson
        }
    }

    save(filebase, data) {
        if (!filebase) {
            return false
        }
        try {
            filebase = this.fileBase(this.path(filebase))
            const filePath = filebase + '.json'
            this.folderCheck(filePath) // Make sure folder exists
            const tmpFile = filebase + (new Date().getTime()) + '.json'
            fs.copyFile(filePath, tmpFile, (cpErr) => {
                fs.writeFile(filePath, JSON.stringify(data), 'utf8', (wErr) => {
                    if (!wErr && !cpErr) {
                        fs.unlink(tmpFile, (dErr) => { })
                    }
                })
            })
            return true
        } catch (error) {
            return false
        }
    }

    fileBase(filePath) {
        return path.join(this.folderName(filePath), path.basename(filePath, '.json'))
    }

}

module.exports = Json
