const _ = require('underscore')

module.exports = (deviceGroups, devices = []) => (
	_.chain(deviceGroups)
		.map((group) => group.get('devices'))
		.flatten()
		.concat(devices) // Add other
		.uniq()
		.value()
)
