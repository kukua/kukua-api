class Base {
	constructor (config = {}) {
		this._config = config
	}

	getConfig () {
		return this._config
	}

	exec () {
		throw new Error('Not implemented.')
	}
}

module.exports = Base
