const BaseModel = require('./Base')

class UserConfigModel extends BaseModel {
	loadUser () {
		return this._getProvider('user').findByID(this.get('user_id'))
			.then((user) => {
				this.set('user', user)
			})
	}
}

module.exports = UserConfigModel
