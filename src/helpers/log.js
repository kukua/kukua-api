const bunyan = require('bunyan')

module.exports = (name, logPath) => {
	var log = bunyan.createLogger({
		name,
		streams: [
			{
				level: 'info',
				stream: process.stdout,
			},
			{
				level: 'debug',
				path: logPath,
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

	return log
}
