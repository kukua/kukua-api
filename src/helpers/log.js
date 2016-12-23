const bunyan = require('bunyan')

module.exports = (name, logPath) => bunyan.createLogger({
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
