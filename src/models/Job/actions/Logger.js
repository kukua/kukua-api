const Promise = require('bluebird')
const BaseAction = require('./Base')

class LoggerAction extends BaseAction {
	exec (data) {
		this._log.info({ data })
		return Promise.resolve()
	}
}

LoggerAction.key = 'logger'

module.exports = LoggerAction
