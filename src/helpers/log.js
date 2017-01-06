const path = require('path')
const bunyan = require('bunyan')
const bunyanDebugStream = require('bunyan-debug-stream')
const RotatingFileStream = require('bunyan-rotating-file-stream')

const logPath = String(process.env.LOG_PATH || '/tmp/output.log')

// Add stack to errors
const logError = bunyan.prototype.error
bunyan.prototype.error = function (data, err) {
	if (err === undefined) {
		err = data
		data = null
	}
	if ( ! (err instanceof Error)) {
		err = new Error(err)
	}
	if ( ! data) data = {}

	if (typeof err.data === 'object') data.data = err.data

	data.stack = err.stack
	logError.apply(this, [data, err.message])
}

const log = bunyan.createLogger({
	name: 'api',
	streams: [
		{
			level: 'info',
			type: 'raw',
			stream: bunyanDebugStream({
				basepath: path.resolve('.'),
				forceColor: true,
			}),
		},
		{
			level: 'debug',
			type: 'raw',
			stream: new RotatingFileStream({
				path: logPath,
				period: '1d',
			}),
		},
	]
})

if (process.env.NODE_ENV !== 'production') {
	log.level('debug')
}

module.exports = log
