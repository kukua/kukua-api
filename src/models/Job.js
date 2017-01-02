const Base = require('./Base')
const mapProviderMethods = require('../helpers/mapProviderMethods')

var User

class JobModel extends Base {
	loadUser () {
		return User.findById(this.get('user_id')).then((user) => {
			this.set('user', user)
		})
	}
}

JobModel.setProvider = (JobProvider) => {
	mapProviderMethods(JobModel, JobProvider)
}
JobModel.setRelations = (UserModel) => {
	User = UserModel
}

module.exports = JobModel
