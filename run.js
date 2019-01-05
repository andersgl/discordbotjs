const config = require('./config/bot.json')
const commandLineArgs = require('command-line-args')
const options = commandLineArgs([{ name: 'token', alias: 't', type: String }])
if (options.token) {
    config.token = options.token
}
const Bot = require('./bot/bot')
const bot = new Bot(config)
bot.connect()
