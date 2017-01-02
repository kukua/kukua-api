const Base = require('./Base')
const mapProviderMethods = require('../helpers/mapProviderMethods')

var UserConfig, Job

class UserModel extends Base {
	loadConfig () {
		return UserConfig.findByUser(this).then((config) => {
			this.set('config', config)
		})
	}
	loadJobs () {
		return Job.findByUser(this).then((jobs) => {
			this.set('jobs', jobs)
		})
	}
}

UserModel.setProvider = (UserProvider) => {
	mapProviderMethods(UserModel, UserProvider)
}
UserModel.setRelations = (UserConfigModel, JobModel) => {
	UserConfig = UserConfigModel
	Job = JobModel
}

module.exports = UserModel
