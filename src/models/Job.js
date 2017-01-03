const Base = require('./Base')
const joi = require('../helpers/jobJoi')
const mapProviderMethods = require('../helpers/mapProviderMethods')

class JobModel extends Base {
	constructor (attributes) {
		super(attributes)
		this._running = false
	}

	getSchema () {
		return joi.object().keys({
			id: joi.string().required(),
			trigger: joi.object().keys({
				schedule: joi.alternatives().try(
					joi.object().keys({
						interval: joi.duration().required(),
					}),
					joi.object().keys({
						cron: joi.cron().required(),
					})
				).required(),
			}).required(),
			throttle_period: joi.duration(),
		})
	}
	validate () {
		joi.assert(this.get(), this.getSchema())
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
		console.log('exec', this.id)
	}
}

JobModel.setProvider = (JobProvider) => {
	mapProviderMethods(JobModel, JobProvider)
}
//JobModel.setRelations = () => {}

module.exports = JobModel
