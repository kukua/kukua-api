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
	var groups = _.chain((req.query.groups || '').split(',')).compact().uniq().value()

	if (groups.length > 0) {
		return Promise.all(groups.map((id) => DeviceGroup.findById(id)))
			.then((deviceGroups) => ({ udids, deviceGroups }))
	} else {
		return Promise.resolve({ udids, deviceGroups: [] })
	}
}
