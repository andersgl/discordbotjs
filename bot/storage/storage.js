class Storage {
    path(filename) {
        return process.cwd() + '/storage/json/' + filename
    }
}

module.exports = Storage
