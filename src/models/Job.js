const Base = require('./Base')
const mapProviderMethods = require('../helpers/mapProviderMethods')

class JobModel extends Base {
}

JobModel.setProvider = (JobProvider) => {
	mapProviderMethods(JobModel, JobProvider)
}
//JobModel.setRelations = () => {}

module.exports = JobModel
