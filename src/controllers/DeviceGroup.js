const auth = require('../helpers/authenticate')
const DeviceGroup = require('../models/DeviceGroup')
const addIncludes = require('../helpers/addIncludes')
const respondWithError = require('../helpers/respondWithError')
const Device = require('../models/Device')
const respondWithOK = require('../helpers/respondWithOK')
const { NotFoundError } = require('../helpers/errors')

module.exports = class DeviceGroupController {
	constructor (app, log) {
		this._log = log

		app.get('/deviceGroups', auth(), this.onIndex.bind(this))
		app.put('/devices/:udid([\\da-fA-F]{16})/groups/:groupId([\\da-z\\-]+)', auth(), this.onAdd.bind(this))
		app.delete('/devices/:udid([\\da-fA-F]{16})/groups/:groupId([\\da-z\\-]+)', auth(), this.onRemove.bind(this))
	}

	onIndex (req, res) {
		DeviceGroup.find().then((groups) => {
			return Promise.all(groups.map((group) => addIncludes(req, group)))
		}).then((groups) => {
			res.json(groups)
		}).catch((err) => {
			this._log.error(err)
			respondWithError(res)
		})
	}
	onAdd (req, res) {
		Device.findByUDID(req.params.udid).then((device) => {
			return DeviceGroup.addDeviceToGroup(device, req.params.groupId)
		}).then(() => {
			respondWithOK(res)
		}).catch(NotFoundError, () => {
			respondWithError(res, 404, 'Device not found.')
		}).catch((err) => {
			this._log.error(err)
			respondWithError(res)
		})
	}
	onRemove (req, res) {
		Device.findByUDID(req.params.udid).then((device) => {
			return DeviceGroup.removeDeviceFromGroup(device, req.params.groupId)
		}).then(() => {
			respondWithOK(res)
		}).catch(NotFoundError, () => {
			respondWithError(res, 404, 'Device not found.')
		}).catch((err) => {
			this._log.error(err)
			respondWithError(res)
		})
	}
}
