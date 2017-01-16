const _ = require('underscore')
const Promise = require('bluebird')
const BaseController = require('./Base')

class JobController extends BaseController {
	constructor (app, providerFactory) {
		super(app, providerFactory)

		this._log = this._getProvider('log').child({ type: 'jobs' })

		var auth = this._getProvider('auth')

		app.get('/jobs', auth.middleware, this._onIndex.bind(this))
		app.get('/jobs/:id([\\w\\.]+)', auth.middleware, this._onShow.bind(this))
		app.post('/jobs/:id([\\w\\.]+)/trigger', auth.middleware, this._onTrigger.bind(this))
		app.put('/jobs/:id([\\w\\.]+)', auth.middleware, this._onUpdate.bind(this))
		app.delete('/jobs/:id([\\w\\.]+)', auth.middleware, this._onRemove.bind(this))
	}

	_onIndex (req, res) {
		this._getProvider('job').find()
			.then((jobs) => Promise.all(jobs.map((job) => this._addIncludes(req, job))))
			.then((jobs) => res.json(jobs))
			.catch((err) => res.error(err))
	}
	_onShow (req, res) {
		this._getProvider('job').findById(req.params.id)
			.then((job) => this._addIncludes(req, job))
			.then((job) => res.json(job))
			.catch((err) => res.error(err))
	}
	_onTrigger (req, res) {
		this._getProvider('job').findById(req.params.id)
			.then((job) => job.exec())
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
	_onUpdate (req, res) {
		this._getProvider('job').updateById(req.params.id, req.body)
			.then((job) => this._updateJob(job))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
	_onRemove (req, res) {
		var provider = this._getProvider('job')

		provider.findById(req.params.id)
			.then((job) => this._removeJob(job))
			.then((job) => provider.remove(job))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}

	startAllJobs () {
		if (this._jobs !== undefined) throw new Error('Jobs already started.')

		this._jobs = []

		return this._getProvider('job').find()
			.then((jobs) => Promise.all(jobs.map((job) => this._startJob(job))))
			.then((jobs) => {
				var total = jobs.length
				var level = 'info'
				var description = `all ${total}`

				this._jobs = _.compact(jobs)

				if (this._jobs.length !== total) {
					level = 'warn'
					description = `${this._jobs.length}/${total}`
				}

				this._log[level]({ job_ids: _.pluck(this._jobs, 'id') }, `Started ${description} jobs.`)
			})
	}
	_updateJob (job) {
		return this._removeJob(job)
			.then(() => this._startJob(job))
			.then(() => {
				this._jobs.push(job)
				return job
			})
	}
	_removeJob (job) {
		var runningJob = _.find(this._jobs, (item) => item.id === job.id)

		if ( ! runningJob) return Promise.resolve(job)

		return this._stopJob(runningJob)
			.then(() => {
				this._jobs = _.without(this._jobs, runningJob)
				return job
			})
	}
	_startJob (job) {
		return job.start()
			.then(() => {
				this._log.info({
					job_id: job.id,
					is_running: job.isRunning,
				}, `Started job ${job.id}.`)
				return job
			})
			.catch((err) => {
				this._log.error({
					job_id: job.id,
					is_running: job.isRunning,
				}, err)
			})
	}
	_stopJob (job) {
		return job.stop()
			.then(() => {
				this._log.info({
					job_id: job.id,
					is_running: job.isRunning,
				}, `Stopped job ${job.id}.`)
				return job
			})
	}
}

module.exports = JobController
