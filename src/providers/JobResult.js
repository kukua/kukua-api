const path = require('path')
const Promise = require('bluebird')
const Datastore = require('nedb')
const deepcopy = require('deepcopy')
const BaseProvider = require('./Base')
const JobResultModel = require('../models/JobResult')
const JobModel = require('../models/Job')

class JobResultProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		this._JobResultModel = JobResultModel
		this._JobModel = JobModel

		var filePath = path.resolve(process.env.JOB_RESULT_DB_PATH)
		this._createDB(filePath)
	}

	_createDB (filePath) {
		var db = this._db = new Datastore({
			filename: filePath,
			autoload: true,
			timestampData: true,
		})

		db.ensureIndex({ fieldName: 'jobID' }, (err) => {
			if (err) throw new Error(err)
		})
	}

	_createModel (result) {
		var attr = {
			id: result._id,
			job_id: result.jobID,
			data: result.data,
			error: result.error,
			created_at: result.createdAt,
			updated_at: result.updatedAt,
		}

		return new (this._JobResultModel)(attr, this._getProviderFactory())
	}
	_prepareData (result) {
		var data = deepcopy(result.get())
		data.jobID = data.job_id
		delete data.job_id
		return data
	}

	findByJob (job, limit = null) {
		return new Promise((resolve, reject) => {
			if ( ! (job instanceof this._JobModel)) {
				return reject('Invalid job model.')
			}

			var statement = this._db
				.find({ jobID: job.id })
				.sort({ createdAt: -1 })

			if (limit) {
				statement = statement.limit(limit)
			}

			statement.exec((err, results) => {
				if (err) return reject(err)
				resolve(results.map((result) => this._createModel(result)))
			})
		})
	}
	create (result) {
		return new Promise((resolve, reject) => {
			if ( ! (result instanceof this._JobResultModel)) {
				return reject('Invalid job result model.')
			}

			try {
				result.validate()
			} catch (err) {
				return reject(err)
			}

			this._db.insert(this._prepareData(result), (err, doc) => {
				if (err) return reject(err)
				result.set('id', doc._id)
				resolve(result)
			})
		})
	}
}

module.exports = JobResultProvider
