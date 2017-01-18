const Promise = require('bluebird')
const moment = require('moment-timezone')
const FilterModel = require('./Filter')
const DeviceGroupModel = require('./DeviceGroup')

const aggregators = ['sum', 'avg', 'min', 'max', 'count', 'std', 'varience']

class MeasurementFilterModel extends FilterModel {
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
	checkSortField (name) {
		if ( ! this.getFields().find(({ column }) => column === name)) {
			throw new Error(`Unable to sort on missing field "${name}".`)
		}
	}

	serialize () {
		var data = this.toJSON()
		delete data.all_device_ids
		return JSON.stringify(data)
	}

	toJSON () {
		var data = super.toJSON()

		data.devices = this.getDevices()
		data.device_groups = this.getDeviceGroups().map((group) => group.id)
		data.all_device_ids = this.getAllDeviceIDs()
		data.interval = this.getInterval()

		return data
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
