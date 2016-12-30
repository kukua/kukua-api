const moment = require('moment-timezone')
const mapProviderMethods = require('../helpers/mapProviderMethods')

const aggregators = ['sum', 'avg', 'min', 'max']

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
	getUDIDs () {
		return this._udids
	}
	addField (name, aggregator = 'avg') {
		if (aggregators.indexOf(aggregator) === -1) throw new Error('Invalid aggregator.')

		this._fields.push({ name, aggregator })
		return this
	}
	getFields () {
		return this._fields
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
	getInterval () {
		return this._interval
	}
	setFrom (date) {
		if ( ! (date instanceof moment)) throw new Error('Invalid from date.')

		this._from = date
		return this
	}
	getFrom () {
		return this._from
	}
	setTo (date) {
		if ( ! (date instanceof moment)) throw new Error('Invalid to date.')

		this._to = date
		return this
	}
	getTo () {
		return this._to
	}
	addSort (name, order = 1) {
		this._sort.push({ name, order })
		return this
	}
	getSorting () {
		return this._sort
	}
	setLimit (limit) {
		limit = Math.round(limit)

		if (isNaN(limit) || typeof limit !== 'number') {
			throw new Error('Invalid limit.')
		}

		this._limit = limit
		return this
	}
	getLimit () {
		return this._limit
	}

	toJSON () {
		return {
			udids: this.getUDIDs(),
			fields: this.getFields(),
			interval: this.getInterval(),
			from: this.getFrom().toISOString(),
			to: this.getTo().toISOString(),
			sort: this.getSorting(),
			limit: this.getLimit(),
		}
	}
}

MeasurementFilterModel.setProvider = (MeasurementFilterProvider) => {
	mapProviderMethods(MeasurementFilterModel, MeasurementFilterProvider)
}
//MeasurementFilterModel.setRelations = () => {}

module.exports = MeasurementFilterModel
