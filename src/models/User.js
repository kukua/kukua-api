const BaseModel = require('./Base')

class UserModel extends BaseModel {
	get key () { return 'user' }

	loadConfig () {
		return this._getProvider('userConfig').findByUser(this)
			.then((config) => {
				var key = 'config'
				this.set(key, config)
				return [key, config]
			})
	}
	loadGroups () {
		return this._getProvider('userGroup').findByUser(this)
			.then((groups) => {
				var key = 'groups'
				this.set(key, groups)
				return [key, groups]
			})
	}
}

module.exports = UserModel
