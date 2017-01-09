const Promise = require('bluebird')
const _ = require('underscore')
const auth = require('../helpers/authenticate')
const log = require('../helpers/log').child({ type: 'jobs' })
const Job = require('../models/Job')
const addIncludes = require('../helpers/addIncludes')

module.exports = class JobController {
	constructor (app) {
		app.get('/jobs', auth(true), this.onIndex.bind(this))
		app.get('/jobs/:id([\\w\\.]+)', auth(true), this.onShow.bind(this))
		app.post('/jobs/:id([\\w\\.]+)/trigger', auth(true), this.onTrigger.bind(this))
		app.put('/jobs/:id([\\w\\.]+)', auth(true), this.onUpdate.bind(this))
		app.delete('/jobs/:id([\\w\\.]+)', auth(true), this.onRemove.bind(this))
	}

	onIndex (req, res) {
		Job.find()
			.then((jobs) => Promise.all(jobs.map((job) => addIncludes(req, job))))
			.then((jobs) => res.json(jobs))
			.catch((err) => res.error(err))
	}
	onShow (req, res) {
		Job.findById(req.params.id)
			.then((job) => addIncludes(req, job))
			.then((job) => res.json(job))
			.catch((err) => res.error(err))
	}
	onTrigger (req, res) {
		Job.findById(req.params.id)
			.then((job) => job.exec())
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
	onUpdate (req, res) {
		Job.updateById(req.params.id, req.body)
			.then((job) => this._updateJob(job))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
	onRemove (req, res) {
		Job.findById(req.params.id)
			.then((job) => this._removeJob(job))
			.then((job) => Job.remove(job))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}

	startAllJobs () {
		if (this._jobs !== undefined) throw new Error('Jobs already started.')

		this._jobs = []

		return Job.find()
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

				log[level]({ job_ids: _.pluck(this._jobs, 'id') }, `Started ${description} jobs.`)
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

		return this._stopJob(runningJob).then(() => {
			this._jobs = _.without(this._jobs, runningJob)
			return job
		})
	}
	_startJob (job) {
		return job.start().then(() => {
			log.info({
				job_id: job.id,
				is_running: job.isRunning,
			}, `Started job ${job.id}.`)
			return job
		}).catch((err) => {
			log.error({
				job_id: job.id,
				is_running: job.isRunning,
			}, err)
		})
	}
	_stopJob (job) {
		return job.stop().then(() => {
			log.info({
				job_id: job.id,
				is_running: job.isRunning,
			}, `Stopped job ${job.id}.`)
			return job
		})
	}
}
