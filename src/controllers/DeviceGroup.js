const auth = require('../helpers/authenticate')
const DeviceGroup = require('../models/DeviceGroup')
const addIncludes = require('../helpers/addIncludes')
const Device = require('../models/Device')
const { NotFoundError } = require('../helpers/errors')

module.exports = class DeviceGroupController {
	constructor (app, log) {
		this._log = log

		app.get('/deviceGroups', auth(), this.onIndex.bind(this))
		app.put('/devices/:udid([\\da-fA-F]{16})/groups/:groupId([\\da-z\\-]+)', auth(), this.onUpdate.bind(this))
		app.delete('/devices/:udid([\\da-fA-F]{16})/groups/:groupId([\\da-z\\-]+)', auth(), this.onRemove.bind(this))
	}

	onIndex (req, res) {
		DeviceGroup.find().then((groups) => {
			return Promise.all(groups.map((group) => addIncludes(req, group)))
		}).then((groups) => {
			res.json(groups)
		}).catch((err) => { res.error(err) })
	}
	onUpdate (req, res) {
		Device.findByUDID(req.params.udid).then((device) => {
			return DeviceGroup.addDeviceToGroup(device, req.params.groupId)
		}).then(() => {
			res.ok()
		}).catch(NotFoundError, () => { res.status(404).error('Device not found.')
		}).catch((err) => { res.error(err) })
	}
	onRemove (req, res) {
		Device.findByUDID(req.params.udid).then((device) => {
			return DeviceGroup.removeDeviceFromGroup(device, req.params.groupId)
		}).then(() => {
			res.ok()
		}).catch(NotFoundError, () => { res.status(404).error('Device not found.')
		}).catch((err) => { res.error(err) })
	}
}
