const Base = require('./Base')
const mapProviderMethods = require('../helpers/mapProviderMethods')

class UserModel extends Base {
}

UserModel.setProvider = (UserProvider) => {
	mapProviderMethods(UserModel, UserProvider)
}
//UserModel.setRelations = () => {}

module.exports = UserModel
