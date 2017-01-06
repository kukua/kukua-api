const Validator = require('validatorjs')
const Base = require('./Base')
const { ValidationError } = require('../helpers/errors')
const mapProviderMethods = require('../helpers/mapProviderMethods')
const log = require('../helpers/log').child({ type: 'jobs' })

var MeasurementFilter, Measurement

class JobModel extends Base {
	constructor (attributes) {
		super(attributes)
	}

	getSchema () {
		return {
			id: 'required|string|regex:/^[\\w\\.]+$/',
			trigger: {
				schedule: {
					interval: 'required_without:trigger.schedule.cron|string',
					cron: 'required_without:trigger.schedule.interval|string',
				},
			},
			input: {
				measurements: {
					filter: {
						udids: 'required_without:input.measurements.filter.device_groups|array',
						device_groups: 'required_without:input.measurements.filter.udids|array',
						fields: 'required|array',
						interval: 'required|numeric',
						from: 'date',
						to: 'date',
						sort: 'required|array',
						limit: 'numeric',
					},
				},
			},
			//condition: 'object',
			throttle_period: 'string',
			created_at: 'date',
			updated_at: 'date',
		}
	}
	validate () {
		var validator = new Validator(this.get(), this.getSchema())

		if (validator.fails()) {
			throw new ValidationError('Invalid job.', validator.errors.all())
		}
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
