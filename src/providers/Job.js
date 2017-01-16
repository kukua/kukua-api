const path = require('path')
const Promise = require('bluebird')
const Datastore = require('nedb')
const providers = require('./')
const JobModel = require('../models/Job')
const { NotFoundError } = require('../helpers/errors')

const db = new Datastore({
	filename: path.resolve(process.env.JOB_DB_PATH),
	autoload: true,
	timestampData: true,
})

db.ensureIndex({ fieldName: 'id', unique: true }, (err) => {
	if (err) throw new Error(err)
})

const methods = {
	_createModel (job) {
		job.created_at = job.createdAt
		job.updated_at = job.updatedAt

		delete job._id
		delete job.createdAt
		delete job.updatedAt

		if (job.condition && typeof job.condition.compare === 'string') {
			job.condition.compare = JSON.parse(job.condition.compare)
		}
		if (typeof job.actions === 'string') {
			job.actions = JSON.parse(job.actions)
		}

		return new JobModel(job, providers)
	},
	_prepareData (data) {
		if (data.condition && typeof data.condition.compare === 'object') {
			data.condition.compare = JSON.stringify(data.condition.compare)
		}
		if (typeof data.actions === 'object') {
			data.actions = JSON.stringify(data.actions)
		}

		return data
	},
	find: () => new Promise((resolve, reject) => {
		db.find({}, (err, jobs) => {
			if (err) return reject(err)
			resolve(jobs.map((job) => methods._createModel(job)))
		})
	}),
	findByID: (id) => new Promise((resolve, reject) => {
		if (typeof id !== 'string') return reject('Invalid job key given.')

		db.findOne({ id }, (err, job) => {
			if (err) return reject(err)
			if ( ! job) return reject(new NotFoundError())
			resolve(methods._createModel(job))
		})
	}),
	updateByID: (id, data) => new Promise((resolve, reject) => {
		if (typeof id !== 'string') return reject('Invalid job key given.')
		if (typeof data !== 'object') return reject('Invalid data object given.')

		delete data.created_at
		delete data.updated_at

		data.id = id
		var job = new JobModel(data, providers)

		try {
			job.validate()
		} catch (err) {
			return reject(err)
		}

		db.update(
			{ id },
			methods._prepareData(job.toJSON()),
			{ upsert: true },
			(err /*, numReplaced, upsert*/) => {
				if (err) return reject(err)

				methods.findByID(id)
					.then(resolve, reject)
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

	isRunning:  (job) => providers('jobScheduler').isRunning(job),
	schedule:   (job) => providers('jobScheduler').schedule(job),
	unschedule: (job) => providers('jobScheduler').unschedule(job),
}

module.exports = methods
