const Promise = require('bluebird')
const auth = require('../helpers/authenticate')
const Job = require('../models/Job')
const addIncludes = require('../helpers/addIncludes')
const { NotFoundError } = require('../helpers/errors')

module.exports = class JobController {
	constructor (app, log) {
		this._log = log

		app.get('/jobs', auth(true), this.onIndex.bind(this))
		app.get('/jobs/:id([\\w\\.]+)', auth(true), this.onShow.bind(this))
		app.put('/jobs/:id([\\w\\.]+)', auth(true), this.onUpdate.bind(this))
		app.delete('/jobs/:id([\\w\\.]+)', auth(true), this.onRemove.bind(this))
	}

	onIndex (req, res) {
		Job.find().then((jobs) => {
			return Promise.all(jobs.map((job) => addIncludes(req, job)))
		}).then((jobs) => {
			res.json(jobs)
		}).catch((err) => { res.error(err) })
	}
	onShow (req, res) {
		Job.findById(req.params.id).then((job) => {
			return addIncludes(req, job)
		}).then((job) => {
			res.json(job)
		}).catch(NotFoundError, () => { res.status(404).error('Job not found.')
		}).catch((err) => { res.error(err) })
	}
	onUpdate (req, res) {
		Job.update(req.params.id, req.body).then(() => {
			res.ok()
		}).catch((err) => { res.error(err) })
	}
	onRemove (req, res) {
		Job.remove(req.params.id).then(() => {
			res.ok()
		}).catch(NotFoundError, () => { res.status(404).error('Job not found.')
		}).catch((err) => { res.error(err) })
	}
}
