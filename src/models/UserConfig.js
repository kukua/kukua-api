const Base = require('./Base')
const mapProviderMethods = require('../helpers/mapProviderMethods')

var User

class UserConfigModel extends Base {
	loadUser () {
		return User.findById(this.get('user_id')).then((user) => {
			this.set('user', user)
		})
	}
}

UserConfigModel.setProvider = (UserConfigProvider) => {
	mapProviderMethods(UserConfigModel, UserConfigProvider)
}
UserConfigModel.setRelations = (UserModel) => {
	User = UserModel
}

module.exports = UserConfigModel
