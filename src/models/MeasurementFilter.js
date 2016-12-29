const moment = require('moment-timezone')
const mapProviderMethods = require('../helpers/mapProviderMethods')

const aggregators = ['avg', 'min', 'max']

class MeasurementFilterModel {
	constructor () {
		this._udids = []
		this._fields = []
		this._interval = null
		this._from = null
		this._to = null
		this._sort = []
		this._limit = null
	}

	setUDIDs (udids) {
		if ( ! Array.isArray(udids)) {
			throw new Error('Invalid UDIDs.')
		}

		this._udids = udids
		return this
	}
	addField (name, aggregator = 'avg') {
		if (aggregators.indexOf(aggregator) === -1) throw new Error('Invalid aggregator.')

		this._fields.push({ name, aggregator })
		return this
	}
	setInterval (interval) {
		interval = Math.round(interval)

		if (isNaN(interval) || typeof interval !== 'number') {
			throw new Error('Invalid interval.')
		}
		if (interval <= 300) {
			throw new Error('Interval is too low.')
		}

		this._interval = interval
		return this
	}
	setFrom (date) {
		if ( ! (date instanceof moment)) throw new Error('Invalid from date.')

		this._from = date
		return this
	}
	setTo (date) {
		if ( ! (date instanceof moment)) throw new Error('Invalid to date.')

		this._to = date
		return this
	}
	addSort (name, order = 1) {
		this._sort.push({ name, order })
		return this
	}
	setLimit (limit) {
		limit = Math.round(limit)

		if (isNaN(limit) || typeof limit !== 'number') {
			throw new Error('Invalid limit.')
		}

		this._limit = limit
		return this
	}
}

MeasurementFilterModel.setProvider = (MeasurementFilterProvider) => {
	mapProviderMethods(MeasurementFilterModel, MeasurementFilterProvider)
}
//MeasurementFilterModel.setRelations = () => {}

module.exports = MeasurementFilterModel