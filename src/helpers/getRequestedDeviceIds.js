const _ = require('underscore')
const Promise = require('bluebird')
const DeviceGroup = require('../models/DeviceGroup')

module.exports = (req) => {
	// &devices=abcdef0123456789,...
	var devices = (req.query.devices || '')
		.split(',')
		.map((id) => id.toLowerCase())
		.filter((id) => id.match(/^[a-f0-9]{16}$/)) // Also removes empty value (''.split(',') => [''])

	// &device_groups=country1,country2,...
	var deviceGroups = (req.query.deviceGroups || req.query.groups || '')
	deviceGroups = _.chain(deviceGroups.split(',')).compact().uniq().value()

	if (deviceGroups.length > 0) {
		return Promise.all(deviceGroups.map((id) => DeviceGroup.findById(id)))
			.then((deviceGroups) => ({ devices, deviceGroups }))
	} else {
		return Promise.resolve({ devices, deviceGroups: [] })
	}
}
