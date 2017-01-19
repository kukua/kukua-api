const path = require('path')
const bunyan = require('bunyan')
const bunyanDebugStream = require('bunyan-debug-stream')
const RotatingFileStream = require('bunyan-rotating-file-stream')
const BaseProvider = require('./Base')

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

class LogProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		var logPath = String(process.env.LOG_PATH || '/tmp/output.log')
		this.create(logPath)
	}

	create (logPath) {
		this._log = bunyan.createLogger({
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
						rotateExisting: true,
						startNewFile: true,
					}),
				},
			]
		})
	}

	// Proxy Bunyan methods
	level (...args) { return this._log.level(...args) }
	child (...args) { return this._log.child(...args) }

	fatal (...args) { return this._log.fatal(...args) }
	error (...args) { return this._log.error(...args) }
	warn  (...args) { return this._log.warn(...args)  }
	info  (...args) { return this._log.info(...args)  }
	debug (...args) { return this._log.debug(...args) }
	trace (...args) { return this._log.trace(...args) }
}

module.exports = LogProvider
