const Base = require('./Base')
const joi = require('../helpers/jobJoi')
const mapProviderMethods = require('../helpers/mapProviderMethods')
const log = require('../helpers/log').child({ type: 'jobs' })

var MeasurementFilter, Measurement

class JobModel extends Base {
	constructor (attributes) {
		super(attributes)
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
			input: joi.object().keys({
				measurements: joi.object().keys({
					filter: joi.object().keys({
						udids: joi.array().required(),
						device_groups: joi.array().required(),
						fields: joi.array().required(),
						interval: joi.number().required(),
						from: joi.date().iso(),
						to: joi.date().iso(),
						sort: joi.array().required(),
						limit: joi.number(),
					}).required(),
				}).required(),
			}).required(),
			throttle_period: joi.duration(),
			created_at: joi.date().iso(),
			updated_at: joi.date().iso(),
		})
	}
	validate () {
		joi.assert(this.get(), this.getSchema())
	}

	get isRunning () {
		return JobModel.isRunning(this)
	}

	start () {
		return JobModel.schedule(this).then(() => this)
	}
	stop () {
		return JobModel.unschedule(this).then(() => this)
	}
	exec () {
		log.info({
			job_id: this.id,
			is_executing: true,
		}, `Executing job ${this.id}.`)

		var filter = this.get('input').measurements.filter
		return MeasurementFilter.unserialize(filter)
			.then((filter) => Measurement.findByFilter(filter))
			.then((measurements) => {
				console.log(measurements)
			})
	}
}

JobModel.setProvider = (JobProvider) => {
	mapProviderMethods(JobModel, JobProvider)
}
JobModel.setRelations = (MeasurementFilterModel, MeasurementModel) => {
	MeasurementFilter = MeasurementFilterModel
	Measurement = MeasurementModel
}

module.exports = JobModel
