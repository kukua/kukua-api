try { require('dotenv').config() } catch (ex) { /* Do nothing */ }

require('./models') // Preload models and relations

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = Number(process.env.PORT || 3000)
const version = require('../package.json').version.replace('.0.0', '')

const logPath = String(process.env.LOG_PATH || '/tmp/output.log')
const log = require('./helpers/log')('api', logPath)

const UserController = require('./controllers/User')
const DeviceController = require('./controllers/Device')
const DeviceGroupController = require('./controllers/DeviceGroup')
const MeasurementController = require('./controllers/Measurement')
const JobController = require('./controllers/Job')

log.level('debug')
process.on('uncaughtException', (err) => log.error(err))

// Custom responses
express.response.error = function (err = 'Woah! Something went wrong. We have been notified.') {
	log.error(err)

	if (err instanceof Error) {
		err = err.message
	}
	if (this.statusCode === 200) {
		this.status(500)
	}

	this.json({
		statusCode: this.statusCode,
		message: err,
	})
}
express.response.ok = function (data = {}) {
	this.status(200).json(Object.assign({
		statusCode: 200,
		message: 'OK',
	}, data))
}

// Middleware
app.use(bodyParser.json({ limit: '100kb' }))
app.use((req, res, next) => {
	// Log request
	var { method, url, query, headers, body } = req

	log.info({
		type: 'request',
		version, method, url, query, headers, body
	})

	// Add Api-Version header
	res.setHeader('Api-Version', version)

	// Check Accept header
	if ( ! req.accepts('json')) {
		return res.status(400).error('Request does not accept JSON response.')
	}

	next()
})

new UserController(app)
new DeviceController(app)
new DeviceGroupController(app)
new MeasurementController(app)
new JobController(app)

app.use((req, res, next) => {
	res.status(404).error('Not found.')
	next()
})
app.use((err, req, res, next) => {
	res.status(500).error(err)
	next()
})

app.listen(port, () => log.info({ type: 'status' }, 'Listening on port ' + port))
