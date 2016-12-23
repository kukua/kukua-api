const express = require('express')

try { require('dotenv').config() } catch (ex) { /* Do nothing */ }

const DeviceController = require('./controllers/DeviceController')
const app = express()
const port = Number(process.env.PORT || 3000)
const logPath = String(process.env.LOG_PATH || '/tmp/output.log')
const log = require('./helpers/log')('api', logPath)
const version = require('../package.json').version

log.level('debug')
process.on('uncaughtException', (err) => log.error(err))

app.use((req, res, next) => {
	res.setHeader('Api-Version', version)
	next()
})

new DeviceController(app, log)

app.listen(port, () => log.info({ type: 'status' }, 'Listening on port ' + port))
