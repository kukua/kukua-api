const Promise = require('bluebird')
const parseDuration = require('parse-duration')
const scheduler = require('node-schedule')
const JobModel = require('../models/Job')

var jobs = {}

const methods = {
	isRunning: (job) => !! jobs[job.id],
	schedule: (job) => new Promise((resolve, reject) => {
		if ( ! (job instanceof JobModel)) return reject('Invalid Job given.')
		if (jobs[job.id]) return resolve()

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

		jobs[job.id] = data
		resolve()
	}),
	unschedule: (job) => new Promise((resolve, reject) => {
		if ( ! (job instanceof JobModel)) return reject('Invalid Job given.')
		if ( ! jobs[job.id]) return resolve()

		jobs[job.id].stop()
		delete jobs[job.id]
		resolve()
	}),
}

module.exports = methods
