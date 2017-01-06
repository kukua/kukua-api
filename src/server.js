try { require('dotenv').config() } catch (ex) { /* Do nothing */ }

require('./models') // Preload models and relations

const express = require('express')
const addRequestId = require('express-request-id')
const bodyParser = require('body-parser')
const app = express()
const port = Number(process.env.PORT || 3000)
const version = require('../package.json').version.replace('.0.0', '')

const log = require('./helpers/log')
const { NotFoundError, InternalServerError } = require('./helpers/errors')

const UserController = require('./controllers/User')
const DeviceController = require('./controllers/Device')
const DeviceGroupController = require('./controllers/DeviceGroup')
const MeasurementController = require('./controllers/Measurement')
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
		data =Object.assign(data, err.data)
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
	res.setHeader('X-Api-Version', version)

	// Check headers
	if (req.headers['content-length'] > 0 && req.headers['content-type'] !== 'application/json') {
		return res.status(400).error('Content type must be application/json.')
	}
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
new JobController(app)

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
