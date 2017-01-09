const Promise = require('bluebird')
const Base = require('./Base')

class Logger extends Base {
	exec (data) {
		this._log.info({ data })
		return Promise.resolve()
	}
}

Logger.key = 'logger'

module.exports = Logger
