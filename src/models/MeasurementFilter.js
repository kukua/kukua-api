const Promise = require('bluebird')
const moment = require('moment-timezone')
const BaseModel = require('./Base')
const DeviceGroupModel = require('./DeviceGroup')

const aggregators = ['sum', 'avg', 'min', 'max', 'count', 'std', 'varience']

class MeasurementFilterModel extends BaseModel {
	constructor (attributes, providerFactory) {
		super(attributes, providerFactory)
	}

	setDevices (deviceIDs) {
		if ( ! Array.isArray(deviceIDs)) throw new Error('Invalid device IDs.')

		this.set('devices', deviceIDs)
		return this
	}
	getDevices () {
		return this.get('devices') || []
	}
	setDeviceGroups (groups) {
		if ( ! Array.isArray(groups)) throw new Error('Invalid device groups.')

		groups.forEach((group) => {
			if (group instanceof DeviceGroupModel) return
			throw new Error('Invalid device group.')
		})

		this.set('deviceGroups', groups)
		return this
	}
	getDeviceGroups () {
		return this.get('deviceGroups') || []
	}
	getAllDeviceIDs () {
		return this._getProvider('deviceGroup').getDeviceIDs(this.getDeviceGroups(), this.getDevices())
	}
	addField (name, aggregator = 'avg') {
		if (name === 'timestamp') aggregator = 'max'
		if (aggregators.indexOf(aggregator) === -1) throw new Error('Invalid aggregator.')

		var column = `${name}_${aggregator}`

		if (name === 'timestamp') column = 'timestamp'

		var fields = this.getFields()
		fields.push({ name, column, aggregator })
		this.set('fields', fields)
		return this
	}
	getFields () {
		return this.get('fields') || []
	}
	setInterval (interval) {
		interval = Math.round(interval)

		if (isNaN(interval) || typeof interval !== 'number') {
			throw new Error('Invalid interval.')
		}
		if (interval < 300) {
			throw new Error('Interval is too low.')
		}

		this.set('interval', interval)
		return this
	}
	getInterval () {
		return this.get('interval')
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
		if ( ! this.getFields().find((field) => field.column === name)) {
			throw new Error(`Unable to sort on missing field "${name}".`)
		}

		var sort = this.getSorting()
		sort.push({ name, order })
		this.set('sort', sort)
		return this
	}
	getSorting () {
		return this.get('sort') || []
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
		var data = this.toJSON()
		delete data.all_device_ids
		return JSON.stringify(data)
	}

	toJSON () {
		return {
			devices: this.getDevices(),
			device_groups: this.getDeviceGroups().map((group) => group.id),
			all_device_ids: this.getAllDeviceIDs(),
			fields: this.getFields(),
			interval: this.getInterval(),
			from: this.getFrom().toISOString(),
			to: this.getTo().toISOString(),
			sort: this.getSorting(),
			limit: this.getLimit(),
		}
	}
}

MeasurementFilterModel.unserialize = (json, providerFactory) => {
	try {
		var data = (typeof json === 'object' ? json : JSON.parse(json))
		var filter = new MeasurementFilterModel({}, providerFactory)

		filter.setDevices(data.devices)
		data.fields.map(({ name, aggregator }) => filter.addField(name, aggregator))
		filter.setInterval(data.interval)
		if (data.from) filter.setFrom(moment.utc(data.from))
		if (data.to) filter.setTo(moment.utc(data.to))
		data.sort.map(({ name, order }) => filter.addSort(name, order))
		filter.setLimit(data.limit)

		return Promise.all(data.device_groups.map((id) => providerFactory('deviceGroup').findByID(id)))
			.then((groups) => filter.setDeviceGroups(groups))
	} catch (err) {
		return Promise.reject(err)
	}
}

module.exports = MeasurementFilterModel
