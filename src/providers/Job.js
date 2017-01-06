const path = require('path')
const Promise = require('bluebird')
const Datastore = require('nedb')
const db = new Datastore({
	filename: path.resolve(process.env.JOB_DB_PATH),
	autoload: true,
	timestampData: true,
})
const { NotFoundError } = require('../helpers/errors')
const JobModel = require('../models/Job')
const JobScheduler = require('./JobScheduler')

db.ensureIndex({ fieldName: 'id', unique: true }, (err) => {
	if (err) throw new Error(err)
})

const createModel = (job) => {
	job.created_at = job.createdAt
	job.updated_at = job.updatedAt

	delete job._id
	delete job.createdAt
	delete job.updatedAt

	return new JobModel(job)
}

var methods

module.exports = methods = {
	find: () => new Promise((resolve, reject) => {
		db.find({}, (err, jobs) => {
			if (err) return reject(err)
			resolve(jobs.map((job) => createModel(job)))
		})
	}),
	findById: (id) => new Promise((resolve, reject) => {
		if (typeof id !== 'string') return reject('Invalid job key given.')

		db.findOne({ id }, (err, job) => {
			if (err) return reject(err)
			if ( ! job) return reject(new NotFoundError())
			resolve(createModel(job))
		})
	}),
	updateById: (id, data) => new Promise((resolve, reject) => {
		if (typeof id !== 'string') return reject('Invalid job key given.')
		if (typeof data !== 'object') return reject('Invalid data object given.')

		data.id = id
		var job = new JobModel(data)

		try {
			job.validate()
		} catch (err) {
			return reject(err)
		}

		db.update(
			{ id },
			job.toJSON(),
			{ upsert: true },
			(err /*, numReplaced, upsert*/) => {
				if (err) return reject(err)
				methods.findById(id).then(resolve, reject)
			}
		)
	}),
	remove: (job) => new Promise((resolve, reject) => {
		if ( ! (job instanceof JobModel)) return reject('Invalid Job given.')

		db.remove(
			{ id: job.id },
			{},
			(err /*, numRemoved*/) => {
				if (err) return reject(err)
				resolve(job)
			}
		)
	}),

	isRunning: (job) => JobScheduler.isRunning(job),
	schedule: (job) => JobScheduler.schedule(job),
	unschedule: (job) => JobScheduler.unschedule(job),
}
