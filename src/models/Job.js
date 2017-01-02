const Base = require('./Base')
const mapProviderMethods = require('../helpers/mapProviderMethods')

class JobModel extends Base {
	constructor (attributes) {
		super(attributes)
		this._running = false
	}


	get isRunning () {
		return this._running
	}
	setRunning (running) {
		this._running = !! running
	}

	start () {
		return JobModel.schedule(this).then(() => this)
	}
	stop () {
		return JobModel.unschedule(this).then(() => this)
	}
	exec () {
		console.log('exec', this)
	}
}

JobModel.setProvider = (JobProvider) => {
	mapProviderMethods(JobModel, JobProvider)
}
//JobModel.setRelations = () => {}

module.exports = JobModel
