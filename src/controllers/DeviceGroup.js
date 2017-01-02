const auth = require('../helpers/authenticate')
const DeviceGroup = require('../models/DeviceGroup')
const addIncludes = require('../helpers/addIncludes')
const Device = require('../models/Device')

module.exports = class DeviceGroupController {
	constructor (app) {
		app.get('/deviceGroups', auth(), this.onIndex.bind(this))
		app.put('/devices/:udid([\\da-fA-F]{16})/groups/:groupId([\\da-z\\-]+)', auth(), this.onUpdate.bind(this))
		app.delete('/devices/:udid([\\da-fA-F]{16})/groups/:groupId([\\da-z\\-]+)', auth(), this.onRemove.bind(this))
	}

	onIndex (req, res) {
		DeviceGroup.find()
			.then((groups) => Promise.all(groups.map((group) => addIncludes(req, group))))
			.then((groups) => res.json(groups))
			.catch((err) => res.error(err))
	}
	onUpdate (req, res) {
		Device.findByUDID(req.params.udid)
			.then((device) => DeviceGroup.addDeviceToGroup(device, req.params.groupId))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
	onRemove (req, res) {
		Device.findByUDID(req.params.udid)
			.then((device) => DeviceGroup.removeDeviceFromGroup(device, req.params.groupId))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
}
