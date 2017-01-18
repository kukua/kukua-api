try { require('dotenv').config() } catch (ex) { /* Do nothing */ }

const express = require('express')
const addRequestID = require('express-request-id')
const bodyParser = require('body-parser')
const app = express()
const version = require('../package.json').version.replace('.0.0', '')
const port = Number(process.env.PORT || 3000)

const providers = require('./providers/')

const log = providers('log')

if (process.env.NODE_ENV !== 'production') {
	log.level('debug')
}

const { NotFoundError, InternalServerError } = require('./helpers/errors')

const UserController = require('./controllers/User')
const DeviceController = require('./controllers/Device')
const DeviceGroupController = require('./controllers/DeviceGroup')
const MeasurementController = require('./controllers/Measurement')
const ForecastController = require('./controllers/Forecast')
const JobController = require('./controllers/Job')

// Custom responses
express.response.error = function (err) {
	this.req.log.error(err)

	if ( ! (err instanceof Error)) {
		err = new Error(err)
	}
	if (err.statusCode) {
		this.status(err.statusCode)
	} else if (this.statusCode === 200) {
		this.status(500)
	}

	var data = {
		statusCode: this.statusCode,
		message: err.message,
	}

	if (typeof err.data === 'object') {
		data = Object.assign(data, err.data)
	}

	this.json(data)
}
express.response.ok = function (data = {}) {
	this.status(200).json(Object.assign({
		statusCode: 200,
		message: 'OK',
	}, data))
}

// Middleware
app.use(addRequestID())
app.use((req, res, next) => {
	// Attach log
	req.log = log.child({ rid: req.id })

	next()
})
app.use(bodyParser.json({ limit: '100kb' }))
app.use((req, res, next) => {
	// Log request
	var { method, url, query, headers, body } = req

	req.log.info({
		type: 'request',
		version, method, url, query, headers, body
	})

	// Add Api-Version header
	res.setHeader('X-Api-Version', version)

	// Check headers
	if (req.headers['content-length'] > 0 && req.headers['content-type'] !== 'application/json') {
		return res.status(400).error('Content type must be application/json.')
	}
	if ( ! req.accepts('json')) {
		return res.status(400).error('Request does not accept JSON response.')
	}

	// Create session
	req.session = {}

	next()
})

// Routing
new UserController(app, providers)
new DeviceController(app, providers)
new DeviceGroupController(app, providers)
new MeasurementController(app, providers)
new ForecastController(app, providers)

const jobController = new JobController(app, providers)
jobController.startAllJobs()

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

process.on('uncaughtException', (err) => {
	log.error(err)

	if (err.errno === 'EADDRINUSE') process.exit(1)
})

app.listen(port, () => log.info({ type: 'status' }, 'Listening on port ' + port))
