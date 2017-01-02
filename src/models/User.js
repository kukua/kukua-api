const Base = require('./Base')
const mapProviderMethods = require('../helpers/mapProviderMethods')

var UserConfig

class UserModel extends Base {
	loadConfig () {
		return UserConfig.findByUser(this).then((config) => {
			this.set('config', config)
		})
	}
}

UserModel.setProvider = (UserProvider) => {
	mapProviderMethods(UserModel, UserProvider)
}
UserModel.setRelations = (UserConfigModel) => {
	UserConfig = UserConfigModel
}

module.exports = UserModel
