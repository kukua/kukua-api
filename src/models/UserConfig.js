const BaseModel = require('./Base')

class UserConfigModel extends BaseModel {
	constructor (attributes, providerFactory) {
		super(attributes, providerFactory)
	}

	loadUser () {
		return this._getProvider('user').findById(this.get('user_id'))
			.then((user) => {
				this.set('user', user)
			})
	}
}

module.exports = UserConfigModel
