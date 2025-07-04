#!/bin/sh
set -e
node /app/db/init.js 
pm2-runtime /app/index.js
# exec node /app/index.js $@