const Promise = require('bluebird')
const auth = require('../helpers/authenticate')
const Job = require('../models/Job')
const addIncludes = require('../helpers/addIncludes')
//const { NotFoundError } = require('../helpers/errors')

module.exports = class JobController {
	constructor (app, log) {
		this._log = log

		app.get('/jobs', auth(), this.onIndex.bind(this))
	}

	onIndex (req, res) {
		Job.findByUser(req.user).then((jobs) => {
			return Promise.all(jobs.map((job) => addIncludes(req, job)))
		}).then((jobs) => {
			res.json(jobs)
		}).catch((err) => { res.error(err) })
	}
}
