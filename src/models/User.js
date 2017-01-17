const BaseModel = require('./Base')

class UserModel extends BaseModel {
	loadConfig () {
		return this._getProvider('userConfig').findByUser(this)
			.then((config) => {
				this.set('config', config)
			})
	}
}

module.exports = UserModel
