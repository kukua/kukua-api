const _ = require('underscore')
const Promise = require('bluebird')
const runInVM = require('../helpers/runInVM')
const deepcopy = require('deepcopy')
const BaseModel = require('./Base')
const Validator = require('../helpers/validator')
const { ValidationError } = require('../helpers/errors')
const MeasurementFilterModel = require('./MeasurementFilter')
const JobResultModel = require('./JobResult')
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
			input: 'required|object',
			//condition: 'object',
			transform: 'object',
			actions: 'object',
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
		var result = new JobResultModel({ job_id: this.id }, this._getProviderFactory())

		log.info(`Executing job ${this.id}.`)

		var data = {}

		// Input
		return Promise.all(_.map(this.get('input'), (input, name) => new Promise((resolve, reject) => {
			data[name] = null

			// TODO(mauvm): Allow getting data without executing, to do ACL
			if (input.user_config) {
				var config = input.user_config

				if (typeof config !== 'object' || ! config.where) {
					throw new Error('Invalid input option for "user_config": Missing where object.')
				}
				if ( ! config.where.user_id) {
					throw new Error('Invalid input option for "user_config": Missing where.user_id.')
				}

				this._getProvider('user').findByID(config.where.user_id)
					.then((user) => this._getProvider('userConfig').findByUser(user, { id: config.where.id }))
					.then((config) => data[name] = _.object(
						_.keys(config),
						_.map(config, (item) => item.getValue())
					))
					.then(resolve)
					.catch(reject)
			} else if (input.measurement_filter) {
				MeasurementFilterModel.unserialize(input.measurement_filter, this._getProviderFactory())
					.then((filter) => this._getProvider('measurement').findByFilter(filter))
					.then((list) => data[name] = list.getItems())
					.then(resolve)
					.catch(reject)
			} else {
				reject(`Invalid input option(s) for "${name}": ${Object.keys(input).join(', ')}.`)
			}
		})))
			// TODO(mauvm): Condition

			// Transform
			.then(() => {
				var transform = this.get('transform')

				if ( ! transform) return

				_.forEach(transform, (config, name) => {
					try {
						data[name] = runInVM({
							script: config.script,
							sandbox: {
								data,
								context: data,
								ctx: data,
							},
						})
					} catch (err) {
						throw new Error(`Invalid transform option for "${name}": ${err.message}`)
					}
				})
			})

			// Actions
			.then(() => Promise.all(
				_.map(this.get('actions'), (actions, name) => {
					if (typeof actions !== 'object') {
						throw new Error(`Invalid action "${name}": Not an object.`)
					}

					var actionData = deepcopy(data)

					return Promise.mapSeries(_.map(actions, (action, key) => ({ action, key })), ({ action, key }) => {
						try {
							var Model = _.find(actionModels, (Model) => Model.key === key)

							if ( ! Model) throw new Error(`Unknown action "${key}".`)

							var model = new Model(
								action,
								log.child({ action: `${name}.${key}` })
							)

							return model.exec(actionData)
						} catch (err) {
							throw new Error(`Error in action "${name}": ${err.message}`)
						}
					})
				})
			))

			// Create job result
			.then(() => result.setData(data))
			.catch((err) => result.setError(err))
			.then(() => this._getProvider('jobResult').create(result))

			// Done
			.then(() => log.info({ is_executing: false, job_result_id: result.id }))
	}
}

module.exports = JobModel
