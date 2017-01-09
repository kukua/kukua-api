const _ = require('underscore')
const Promise = require('bluebird')
const deepcopy = require('deepcopy')
const Base = require('./Base')
const Validator = require('../helpers/validator')
const { ValidationError } = require('../helpers/errors')
const mapProviderMethods = require('../helpers/mapProviderMethods')
const log = require('../helpers/log').child({ type: 'jobs' })
const filtr = require('filtr')
const actionModels = require('./Job/actions/')

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
			actions: 'required|object',
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
		var _log = log.child({ job_id: this.id, is_executing: true })
		_log.info(`Executing job ${this.id}.`)

		var filter = this.get('input').measurements.filter

		return MeasurementFilter.unserialize(filter)
			.then((filter) => Measurement.findByFilter(filter))
			.then((measurements) => {
				var filter = filtr(this.get('condition').compare.measurements)
				var results = {}

				try {
					results.measurements = filter.test(measurements.getItems())
				} catch (err) {
					_log.error(err)
					// TODO(mauvm): Improve error response
					throw new Error('Error filtering measurements. Please check the compare condition.')
				}

				return Promise.all(
					_.map(this.get('actions'), (actions, name) => new Promise((resolve, reject) => {
						if (typeof actions !== 'object') return reject(`Invalid action "${name}": Not an object.`)

						var data = deepcopy(results)
						actions = _.map(actions, (action, key) => ({ action, key }))

						return Promise.mapSeries(actions, ({ action, key }) => {
							try {
								var Model = _.find(actionModels, (Model) => Model.key === key)

								if ( ! Model) throw new Error(`Unknown action "${key}".`)

								var model = new Model(action)

								return model.exec(data)
							} catch (err) {
								return reject(`Invalid action "${name}": ${err.message}`)
							}
						})
					}))
				)
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
