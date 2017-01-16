const BaseModel = require('./Base')

class UserModel extends BaseModel {
	constructor (attributes, providerFactory) {
		super(attributes, providerFactory)
	}

	loadConfig () {
		return this._getProvider('userConfig').findByUser(this)
			.then((config) => {
				this.set('config', config)
			})
	}
}

module.exports = UserModel
