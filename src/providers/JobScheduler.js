const Promise = require('bluebird')
const parseDuration = require('parse-duration')
const scheduler = require('node-schedule')
const BaseProvider = require('./Base')
const JobModel = require('../models/Job')

class JobSchedulerProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		this._JobModel = JobModel
		this._jobs = {}
	}

	isRunning (job) {
		return !! this._jobs[job.id]
	}
	schedule (job) {
		return new Promise((resolve, reject) => {
			if ( ! (job instanceof this._JobModel)) return reject('Invalid job model.')
			if (this._jobs[job.id]) return resolve()

			try {
				job.validate()
			} catch (err) {
				return reject(err)
			}

			var schedule = job.get('trigger').schedule
			var data = { job }

			if (schedule.interval) {
				data.timer = setInterval(() => job.exec(), parseDuration(schedule.interval))
				data.stop = () => clearInterval(data.timer)
			} else if (schedule.cron) {
				data.cron = scheduler.scheduleJob(schedule.cron, () => job.exec())
				data.stop = () => data.cron.cancel()
			}

			this._jobs[job.id] = data
			resolve()
		})
	}
	unschedule (job) {
		return new Promise((resolve, reject) => {
			if ( ! (job instanceof JobModel)) return reject('Invalid job model.')
			if ( ! this._jobs[job.id]) return resolve()

			this._jobs[job.id].stop()
			delete this._jobs[job.id]
			resolve()
		})
	}
}

module.exports = JobSchedulerProvider
