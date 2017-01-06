const Base = require('./Base')
const Validator = require('../helpers/validator')
const { ValidationError } = require('../helpers/errors')
const mapProviderMethods = require('../helpers/mapProviderMethods')
const log = require('../helpers/log').child({ type: 'jobs' })
const filtr = require('filtr')

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
					interval: 'required_without:trigger.schedule.cron|duration',
					cron: 'required_without:trigger.schedule.interval|cron',
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
			condition: {
				compare: {
					measurements: 'required|object',
				}
			},
			throttle_period: 'duration',
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
		var logger = log.child({ job_id: this.id, is_executing: true })
		logger.info(`Executing job ${this.id}.`)

		var filter = this.get('input').measurements.filter
		return MeasurementFilter.unserialize(filter)
			.then((filter) => Measurement.findByFilter(filter))
			.then((measurements) => {
				var filter = filtr(this.get('condition').compare.measurements)

				try {
					var results = filter.test(measurements.getItems())
				} catch (err) {
					logger.error(err)
					// TODO(mauvm): Improve error response
					throw new Error('Error filtering measurements. Please check the compare condition.')
				}

				console.log(results)
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
