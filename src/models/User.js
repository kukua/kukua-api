const BaseModel = require('./Base')

class UserModel extends BaseModel {
	get key () { return 'user' }

	loadConfig () {
		return this._getProvider('userConfig').findByUser(this)
			.then((config) => {
				this.set('config', config)
			})
	}
	loadGroups () {
		return this._getProvider('userGroup').findByUser(this)
			.then((groups) => {
				this.set('user_groups', groups)
			})
	}
}

module.exports = UserModel
