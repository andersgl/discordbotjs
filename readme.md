# Discordbot for RaA

## Install & setup
* Run `npm i` to install node dependencies (currently tested in version 8 & 9)
* Copy file `.env.example` to `.env` and fill-in bot token and user IDs of admins (if needed)

## Usage
* On first startup run `./node_modules/pm2/bin/pm2 start run.js --name=discordbotjs` to add bot runtime to pm2 management
* Now you can run these commands:
 * `./node_modules/pm2/bin/pm2 start discordbotjs`
 * `./node_modules/pm2/bin/pm2 stop discordbotjs`
 * `./node_modules/pm2/bin/pm2 restart discordbotjs`
 