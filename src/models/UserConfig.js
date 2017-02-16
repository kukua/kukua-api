const BaseModel = require('./Base')

class UserConfigModel extends BaseModel {
	getValue () {
		return this.get('value')
	}

	loadUser () {
		return this._getProvider('user').findByID(this.get('user_id'))
			.then((user) => {
				var key = 'user'
				this.set(key, user)
				return [key, user]
			})
	}
}

module.exports = UserConfigModel
