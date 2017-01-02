try { require('dotenv').config() } catch (ex) { /* Do nothing */ }

require('./models') // Preload models and relations

const express = require('express')
const addRequestId = require('express-request-id')
const bodyParser = require('body-parser')
const app = express()
const port = Number(process.env.PORT || 3000)
const version = require('../package.json').version.replace('.0.0', '')

const logPath = String(process.env.LOG_PATH || '/tmp/output.log')
const log = require('./helpers/log')('api', logPath)
const { NotFoundError, InternalServerError } = require('./helpers/errors')

const UserController = require('./controllers/User')
const DeviceController = require('./controllers/Device')
const DeviceGroupController = require('./controllers/DeviceGroup')
const MeasurementController = require('./controllers/Measurement')
const JobController = require('./controllers/Job')

if (process.env.NODE_ENV !== 'production') {
	log.level('debug')
}

process.on('uncaughtException', (err) => log.error(err))

// Custom responses
express.response.error = function (err) {
	this.req.log.error(err)

	if (err instanceof Error) {
		if (err.statusCode) {
			this.status(err.statusCode)
		}

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
app.use(addRequestId())
app.use(bodyParser.json({ limit: '100kb' }))
app.use((req, res, next) => {
	// Attach log
	req.log = log.child({ rid: req.id })

	// Log request
	var { method, url, query, headers, body } = req

	req.log.info({
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

// Routing
new UserController(app)
new DeviceController(app)
new DeviceGroupController(app)
new MeasurementController(app)
new JobController(app, log)

// Error handling
app.use((req, res, next) => {
	res.error(new NotFoundError())
	next()
})
app.use((err, req, res, next) => {
	if ( ! (err instanceof Error)) err = new InternalServerError(err)
	res.error(err)
	next()
})

app.listen(port, () => log.info({ type: 'status' }, 'Listening on port ' + port))
