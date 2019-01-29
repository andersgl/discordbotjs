const config = require('./config/bot.json')

require('dotenv').config()
if (process.env.BOT_TOKEN) {
    config.token = process.env.BOT_TOKEN
}
if (process.env.ADMINS) {
    config.admins = process.env.ADMINS.split(',')
}

const commandLineArgs = require('command-line-args')
const options = commandLineArgs([{ name: 'token', alias: 't', type: String }])
if (options.token) {
    config.token = options.token
}
const Bot = require('./bot/bot')
const bot = new Bot(config)
bot.connect()
