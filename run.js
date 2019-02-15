// const winston = require('winston')
const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');
const config = require('./config/bot.json')

require('dotenv').config()
const env = process.env.NODE_ENV || 'production'
const logDir = 'storage/log'
global.logger = createLogger({
    level: env === 'development' ? 'debug' : 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join(logDir, 'all.log') })
    ]
})

if (process.env.BOT_TOKEN) {
    config.token = process.env.BOT_TOKEN
}
if (process.env.ADMINS) {
    config.admins = process.env.ADMINS.split(',')
}
if (process.env.DISABLED_CMDS) {
    config.disabledCmds = process.env.DISABLED_CMDS.split(',')
}

const commandLineArgs = require('command-line-args')
const options = commandLineArgs([{ name: 'token', alias: 't', type: String }])
if (options.token) {
    config.token = options.token
}
const Bot = require('./bot/bot')
const bot = new Bot(config)
bot.connect()
