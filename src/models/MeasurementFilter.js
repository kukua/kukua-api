const Promise = require('bluebird')
const moment = require('moment-timezone')
const mapProviderMethods = require('../helpers/mapProviderMethods')
const getAllDeviceIds = require('../helpers/getAllDeviceIds')

const aggregators = ['sum', 'avg', 'min', 'max', 'count', 'std', 'varience']

var DeviceGroup

class MeasurementFilterModel {
	constructor () {
		this._devices = []
		this._deviceGroups = []
		this._fields = []
		this._interval = null
		this._from = null
		this._to = null
		this._sort = []
		this._limit = null
	}

	setDevices (deviceIds) {
		if ( ! Array.isArray(deviceIds)) throw new Error('Invalid device IDs.')

		this._devices = deviceIds
		return this
	}
	getDevices () {
		return this._devices
	}
	setDeviceGroups (groups) {
		if ( ! Array.isArray(groups)) throw new Error('Invalid device groups.')

		groups.forEach((group) => {
			if (group instanceof DeviceGroup) return
			throw new Error('Invalid device group.')
		})

		this._deviceGroups = groups
		return this
	}
	getDeviceGroups () {
		return this._deviceGroups
	}
	getAllDeviceIds () {
		return getAllDeviceIds(this.getDeviceGroups(), this.getDevices())
	}
	addField (name, aggregator = 'avg') {
		if (name === 'timestamp') aggregator = 'max'
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
		if (interval < 300) {
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

	serialize () {
		var data = this.toJSON()
		delete data.all_device_ids
		return JSON.stringify(data)
	}

	toJSON () {
		return {
			devices: this.getDevices(),
			device_groups: this.getDeviceGroups().map((group) => group.id),
			all_device_ids: this.getAllDeviceIds(),
			fields: this.getFields(),
			interval: this.getInterval(),
			from: this.getFrom().toISOString(),
			to: this.getTo().toISOString(),
			sort: this.getSorting(),
			limit: this.getLimit(),
		}
	}
}

MeasurementFilterModel.unserialize = (json) => {
	try {
		var data = (typeof json === 'object' ? json : JSON.parse(json))
		var filter = new MeasurementFilterModel()

		filter.setDevices(data.devices)
		data.fields.map(({ name, aggregator }) => filter.addField(name, aggregator))
		filter.setInterval(data.interval)
		if (data.from) filter.setFrom(moment.utc(data.from))
		if (data.to) filter.setTo(moment.utc(data.to))
		data.sort.map(({ name, order }) => filter.addSort(name, order))
		filter.setLimit(data.limit)

		return Promise.all(data.device_groups.map((id) => DeviceGroup.findById(id)))
			.then((groups) => filter.setDeviceGroups(groups))
	} catch (err) {
		return Promise.reject(err)
	}
}

MeasurementFilterModel.setProvider = (MeasurementFilterProvider) => {
	mapProviderMethods(MeasurementFilterModel, MeasurementFilterProvider)
}
MeasurementFilterModel.setRelations = (DeviceGroupModel) => {
	DeviceGroup = DeviceGroupModel
}

module.exports = MeasurementFilterModel
