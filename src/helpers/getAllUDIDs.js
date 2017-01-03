const _ = require('underscore')

module.exports = (deviceGroups, udids = []) => (
	_.chain(deviceGroups)
		.map((group) => group.get('device_udids'))
		.flatten()
		.concat(udids) // Add other
		.uniq()
		.value()
)
