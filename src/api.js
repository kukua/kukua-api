const express = require('express')

try { require('dotenv').config() } catch (ex) { /* Do nothing */ }

const DeviceController = require('./controllers/DeviceController')
const app = express()
const port = Number(process.env.PORT || 3000)
const logPath = String(process.env.LOG_PATH || '/tmp/output.log')
const log = require('./helpers/log')('api', logPath)

log.level('debug')
process.on('uncaughtException', (err) => log.error(err))

new DeviceController(app, log)

app.listen(port, () => log.info({ type: 'status' }, 'Listening on port ' + port))
