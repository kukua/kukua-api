class BaseAction {
	constructor (config = {}, log) {
		this._config = config
		this._log = log
	}

	getConfig () {
		return this._config
	}

	exec () {
		throw new Error('Not implemented.')
	}
}

module.exports = BaseAction
