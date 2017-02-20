const _ = require('underscore')
const Promise = require('bluebird')
const runInVM = require('../helpers/runInVM')
const deepcopy = require('deepcopy')
const BaseModel = require('./Base')
const Validator = require('../helpers/validator')
const { ValidationError } = require('../helpers/errors')
const JobResultModel = require('./JobResult')
const inputModels = require('./Job/inputs/')
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

	getInputModels () {
		var providerFactory = this._getProviderFactory()

		return _.map(this.get('input'), (input, name) => {
			var keys = _.keys(input)
			var Model, config

			for (var key of keys) {
				Model = _.find(inputModels, (Model) => Model.key === key)

				if (Model) {
					config = input[key]
					break
				}
			}

			if ( ! Model) {
				throw new Error(`Invalid input option(s) for "${name}": ${keys.join(', ')}.`)
			}

			var model = new Model(config, providerFactory)
			model.setName(name)
			return model
		})
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

		// Input
		return Promise.all(this.getInputModels().map((model) => (
			model.getData().then((values) => [model.getName(), values])
		)))
			// Create key/value object from [[name, values], ...]
			.then((data) => _.object(data))

			// TODO(mauvm): Condition

			// Transform
			.then((data) => {
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

				return data
			})

			// Actions
			.then((data) => Promise.all(
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
			).then(() => data))

			// Create job result
			.then((data) => result.setData(data))
			.catch((err) => result.setError(err))
			.then(() => this._getProvider('jobResult').create(result))

			// Done
			.then(() => log.info({ is_executing: false, job_result_id: result.id }))
	}
}

module.exports = JobModel
