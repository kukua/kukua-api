const Promise = require('bluebird')
const _ = require('underscore')
const auth = require('../helpers/authenticate')
const Job = require('../models/Job')
const addIncludes = require('../helpers/addIncludes')

module.exports = class JobController {
	constructor (app, log) {
		this._log = log.child({ type: 'jobs' })

		app.get('/jobs', auth(true), this.onIndex.bind(this))
		app.get('/jobs/:id([\\w\\.]+)', auth(true), this.onShow.bind(this))
		app.put('/jobs/:id([\\w\\.]+)', auth(true), this.onUpdate.bind(this))
		app.delete('/jobs/:id([\\w\\.]+)', auth(true), this.onRemove.bind(this))

		this._jobs = []
		this.start().then((jobs) => {
			this._log.info({ job_ids: _.pluck(jobs, 'id') }, `Started all ${jobs.length} jobs.`)
		})
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
	onUpdate (req, res) {
		Job.updateById(req.params.id, req.body)
			.then((job) => this.update(job))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
	onRemove (req, res) {
		Job.findById(req.params.id)
			.then((job) => this.remove(job))
			.then((job) => Job.remove(job))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}

	start () {
		return Job.find()
			.then((jobs) => Promise.all(jobs.map((job) => job.start())))
			.then((jobs) => {
				this._jobs = jobs
				return jobs
			})
	}
	stop () {
		return Promise.all(this._jobs.map((job) => job.stop()))
	}
	update (job) {
		return this.remove(job)
			.then(() => job.start())
			.then(() => {
				this._jobs.push(job)
				this._log.info({ job_id: job.id }, `Started job ${job.id}.`)
				return job
			})
	}
	remove (job) {
		var runningJob = _.find(this._jobs, (item) => item.id === job.id)

		if ( ! runningJob) return Promise.resolve(job)

		return runningJob.stop()
			.then(() => {
				this._jobs = _.without(this._jobs, runningJob)
				this._log.info({ job_id: job.id }, `Stopped job ${job.id}.`)
				return job
			})
	}
}
