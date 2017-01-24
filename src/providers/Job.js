const path = require('path')
const Promise = require('bluebird')
const Datastore = require('nedb')
const BaseProvider = require('./Base')
const JobModel = require('../models/Job')
const { NotFoundError } = require('../helpers/errors')

class JobProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		this._JobModel = JobModel

		var filePath = path.resolve(process.env.JOB_DB_PATH)
		this.create(filePath)
	}

	create (filePath) {
		var db = this._db = new Datastore({
			filename: filePath,
			autoload: true,
			timestampData: true,
		})

		db.ensureIndex({ fieldName: 'id', unique: true }, (err) => {
			if (err) throw new Error(err)
		})
	}

	_createModel (data) {
		return new (this._JobModel)(data, this._getProviderFactory())
	}
	_extractData (job) {
		var data = Object.assign({}, job)
		data.created_at = job.createdAt
		data.updated_at = job.updatedAt

		delete data._id
		delete data.createdAt
		delete data.updatedAt

		if (data.condition && typeof data.condition.compare === 'string') {
			data.condition.compare = JSON.parse(data.condition.compare)
		}
		if (typeof data.actions === 'string') {
			data.actions = JSON.parse(data.actions)
		}

		return data
	}
	_prepareData (data) {
		if (data.condition && typeof data.condition.compare === 'object') {
			data.condition.compare = JSON.stringify(data.condition.compare)
		}
		if (typeof data.actions === 'object') {
			data.actions = JSON.stringify(data.actions)
		}

		return data
	}

	find () {
		return new Promise((resolve, reject) => {
			this._db.find({}, (err, jobs) => {
				if (err) return reject(err)
				resolve(jobs.map((job) => this._createModel(this._extractData(job))))
			})
		})
	}
	findByID (id) {
		return new Promise((resolve, reject) => {
			if (typeof id !== 'string') return reject('Invalid job key given.')

			this._db.findOne({ id }, (err, job) => {
				if (err) return reject(err)
				if ( ! job) return reject(new NotFoundError())
				resolve(this._createModel(this._extractData(job)))
			})
		})
	}
	update (job) {
		return new Promise((resolve, reject) => {
			if ( ! (job instanceof this._JobModel)) return reject('Invalid Job given.')

			try {
				job.validate()
			} catch (err) {
				return reject(err)
			}

			this._db.update(
				{ id: job.id },
				this._prepareData(job.toJSON()),
				{ upsert: true },
				(err /*, numReplaced, upsert*/) => {
					if (err) return reject(err)
					this.findByID(job.id).then(resolve, reject)
				}
			)
		})
	}
	remove (job) {
		return new Promise((resolve, reject) => {
			if ( ! (job instanceof this._JobModel)) return reject('Invalid Job given.')

			this._db.remove(
				{ id: job.id },
				{},
				(err /*, numRemoved*/) => {
					if (err) return reject(err)
					resolve(job)
				}
			)
		})
	}

	isRunning  (job) { return this._getProvider('jobScheduler').isRunning(job) }
	schedule   (job) { return this._getProvider('jobScheduler').schedule(job) }
	unschedule (job) { return this._getProvider('jobScheduler').unschedule(job) }
}

module.exports = JobProvider
