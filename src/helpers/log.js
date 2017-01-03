const bunyan = require('bunyan')
const RotatingFileStream = require('bunyan-rotating-file-stream')

const logPath = String(process.env.LOG_PATH || '/tmp/output.log')

var log = bunyan.createLogger({
	name: 'api',
	streams: [
		{
			level: 'info',
			stream: process.stdout,
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

// Add stack to errors
var logError = log.error.bind(log)
log.error = (data, err) => {
	if (err === undefined) {
		err = data
		data = {}
	}
	if ( ! (err instanceof Error)) {
		err = new Error(err)
	}

	data.stack = err.stack
	logError(data, err.message)
}

module.exports = log
