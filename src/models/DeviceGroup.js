const Promise = require('bluebird')
const humanize = require('underscore.string/humanize')
const BaseModel = require('./Base')
const Validator = require('../helpers/validator')
const { ValidationError } = require('../helpers/errors')

class DeviceGroupModel extends BaseModel {
	get key () { return 'deviceGroup' }

	fill (data) {
		// Auto create name for device group
		if ( ! data.name && ! this.get('name')) {
			data.name = humanize(data.id || this.id)
		}

		if ( ! data.devices && ! this.get('devices')) {
			data.devices = []
		}

		return super.fill(data)
	}

	getSchema () {
		return {
			id: 'required|string|regex:/^[a-zA-Z0-9]+$/',
			name: 'required|string',
			devices: 'array',
			created_at: 'date',
			updated_at: 'date',
		}
	}
	validate (data) {
		var validator = new Validator(data || this.get(), this.getSchema())

		if (validator.fails()) {
			throw new ValidationError('Invalid device group.', validator.errors.all())
		}
	}

	loadDevices () {
		var deviceIDs = this.get('devices')

		if ( ! Array.isArray(deviceIDs)) deviceIDs = []

		return Promise.all(deviceIDs.map((id) => this._getProvider('device').findByID(id)))
			.then((devices) => {
				this.set('devices', devices)
			})
	}
}

module.exports = DeviceGroupModel
