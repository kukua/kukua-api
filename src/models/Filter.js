const Promise = require('bluebird')
const moment = require('moment-timezone')
const BaseModel = require('./Base')

class FilterModel extends BaseModel {
	getFields () {
		return this.get('fields') || []
	}
	setFrom (date) {
		if ( ! (date instanceof moment) || ! date.isValid()) throw new Error('Invalid from date.')

		this.set('from', date)
		return this
	}
	getFrom () {
		return this.get('from')
	}
	setTo (date) {
		if ( ! (date instanceof moment) || ! date.isValid()) throw new Error('Invalid to date.')

		this.set('to', date)
		return this
	}
	getTo () {
		return this.get('to')
	}
	addSort (name, order = 1) {
		this.checkSortField(name)
		var sort = this.getSorting()
		sort.push({ name, order })
		this.set('sort', sort)
		return this
	}
	getSorting () {
		return this.get('sort') || []
	}
	checkSortField (name) {
		if ( ! this.getFields().find((field) => field === name)) {
			throw new Error(`Unable to sort on missing field "${name}".`)
		}
	}
	setLimit (limit) {
		limit = Math.round(limit)

		if (isNaN(limit) || typeof limit !== 'number') {
			throw new Error('Invalid limit.')
		}

		this.set('limit', limit)
		return this
	}
	getLimit () {
		return this.get('limit')
	}

	serialize () {
		return JSON.stringify(this.toJSON())
	}

	toJSON () {
		return {
			fields: this.getFields(),
			from: this.getFrom().toISOString(),
			to: this.getTo().toISOString(),
			sort: this.getSorting(),
			limit: this.getLimit(),
		}
	}
}

FilterModel.unserialize = (/*json, providerFactory*/) => {
	Promise.reject(new Error('Unserialize method not implemented.'))
}

module.exports = FilterModel
