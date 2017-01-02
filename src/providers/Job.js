const path = require('path')
const Promise = require('bluebird')
const Datastore = require('nedb')
const db = new Datastore({
	filename: path.resolve(process.env.JOB_DB_PATH),
	autoload: true,
	timestampData: true,
})
const JobModel = require('../models/Job')

db.ensureIndex({ fieldName: 'userId' }, (err) => {
	if (err) throw new Error(err)
})

const createModel = (job) => {
	var attr = {
		id: job.id,
		created_at: job.createdAt,
		updated_at: job.updatedAt,
	}

	return new JobModel(attr)
}

module.exports = {
	find: () => new Promise((resolve, reject) => {
		db.find({}, (err, jobs) => {
			if (err) return reject(err)
			resolve(jobs.map((job) => createModel(job)))
		})
	}),
	findById: (id) => new Promise((resolve, reject) => {
		db.findOne({ id }, (err, job) => {
			if (err) return reject(err)
			resolve(createModel(job))
		})
	}),
	update: (id, data) => new Promise((resolve, reject) => {
		db.update(
			{ id },
			{ $set: {
				id,
				data,
			} },
			{ upsert: true },
			(err /*, numReplaced, item*/) => {
				if (err) return reject(err)
				resolve()
			}
		)
	}),
	remove: (id) => new Promise((resolve, reject) => {
		db.remove(
			{ id },
			{},
			(err /*, numRemoved*/) => {
				if (err) return reject(err)
				resolve()
			}
		)
	}),
}
