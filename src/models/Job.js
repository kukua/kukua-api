const _ = require('underscore')
const Promise = require('bluebird')
const deepcopy = require('deepcopy')
const filtr = require('filtr')
const BaseModel = require('./Base')
const Validator = require('../helpers/validator')
const { ValidationError } = require('../helpers/errors')
const MeasurementFilterModel = require('./MeasurementFilter')
const actionModels = require('./Job/actions/')

class JobModel extends BaseModel {
	get key () { return 'job' }

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
						devices: 'required_without:input.measurements.filter.device_groups|array',
						device_groups: 'required_without:input.measurements.filter.devices|array',
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
	validate (data) {
		var validator = new Validator(data || this.get(), this.getSchema())

		if (validator.fails()) {
			throw new ValidationError('Invalid job.', validator.errors.all())
		}
	}

	get isRunning () {
		return this._getProvider('job').isRunning(this)
	}

	getMeasurementFilter () {
		var filter = this.get('input').measurements.filter
		return MeasurementFilterModel.unserialize(filter, this._getProviderFactory())
	}

	start () {
		return this._getProvider('job').schedule(this)
			.then(() => this)
	}
	stop () {
		return this._getProvider('job').unschedule(this)
			.then(() => this)
	}
	exec () {
		var log = this._getProvider('log').child({ job_id: this.id, is_executing: true })

		log.info(`Executing job ${this.id}.`)

		return this.getMeasurementFilter()
			.then((filter) => this._getProvider('measurement').findByFilter(filter))
			.then((measurements) => {
				var filter = filtr(this.get('condition').compare.measurements)
				var results = {}

				try {
					results.measurements = filter.test(measurements.getItems())
				} catch (err) {
					log.error(err)
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

								var model = new Model(
									action,
									log.child({ action: `${name}.${key}` })
								)

								return model.exec(data)
							} catch (err) {
								return reject(`Invalid action "${name}": ${err.message}`)
							}
						}).then(resolve, reject)
					}))
				)
			})
	}
}

module.exports = JobModel
