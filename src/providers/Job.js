const path = require('path')
const Promise = require('bluebird')
const Datastore = require('nedb')
const db = new Datastore({
	filename: path.resolve(process.env.JOB_DB_PATH),
	autoload: true,
	timestampData: true,
})
const JobModel = require('../models/Job')
const UserModel = require('../models/User')

db.ensureIndex({ fieldName: 'userId' }, (err) => {
	if (err) throw new Error(err)
})

const createModel = (job) => {
	var attr = {
		user_id: job.userId,
		created_at: job.createdAt,
		updated_at: job.updatedAt,
	}

	return new JobModel(attr)
}

module.exports = {
	findByUser: (user) => new Promise((resolve, reject) => {
		if ( ! (user instanceof UserModel)) return reject('Invalid User given.')

		db.find({ userId: user.id }, (err, jobs) => {
			if (err) return reject(err)
			resolve(jobs.map((job) => createModel(job)))
		})
	}),
}
