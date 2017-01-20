const BaseModel = require('./Base')

class UserModel extends BaseModel {
	get key () { return 'user' }

	loadConfig () {
		return this._getProvider('userConfig').findByUser(this)
			.then((config) => {
				this.set('config', config)
			})
	}
}

module.exports = UserModel
