const _ = require('underscore')
const Promise = require('bluebird')
const DeviceGroup = require('../models/DeviceGroup')

module.exports = (req) => {
	// &udids=abcdef0123456789,...
	var udids = (req.query.udids || '')
		.split(',')
		.map((udid) => udid.toLowerCase())
		.filter((udid) => udid.match(/^[a-f0-9]{16}$/)) // Also removes empty value (''.split(',') => [''])

	// &groups=country1,country2,...
	var groups = req.query.groups

	if (groups) {
		return Promise.all(groups.split(',').map((groupId) => DeviceGroup.findById(groupId)))
			.then((results) => {
				return _.uniq(
					_.chain(results)
						.map(([ group ]) => group.get('device_udids'))
						.flatten()
						.value()
						.concat(udids) // Add other
				)
			})
	} else {
		return Promise.resolve(udids)
	}
}
