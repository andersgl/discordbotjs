#!/bin/bash
# Restart bot

git pull
npm install
./node_modules/pm2/bin/pm2 restart discordbotjs
