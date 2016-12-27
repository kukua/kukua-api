const DeviceProvider = require('../providers/Device')
const DeviceGroupProvider = require('../providers/DeviceGroup')
const auth = require('../helpers/authenticate')
const acceptsJSON = require('../helpers/acceptsJSON')
const respondWithError = require('../helpers/respondWithError')
const respondWithOK = require('../helpers/respondWithOK')
const { NotFoundError } = require('../helpers/errors')

module.exports = class DeviceGroupController {
	constructor (app, log) {
		//this._app = app
		this._log = log

		app.put('/devices/:udid([\\da-fA-F]{16})/groups/:groupId([\\da-z\\-]+)', auth(), this.onAdd.bind(this))
		app.delete('/devices/:udid([\\da-fA-F]{16})/groups/:groupId([\\da-z\\-]+)', auth(), this.onRemove.bind(this))
	}

	onAdd (req, res) {
		if ( ! acceptsJSON(req, res)) return

		DeviceProvider.findByUDID(req.params.udid).then((device) => {
			return DeviceGroupProvider.addDeviceToGroup(device, req.params.groupId)
		}).then(() => {
			respondWithOK(res)
		}).catch(NotFoundError, () => {
			respondWithError(res, 404, 'Device not found.')
		}).catch((err) => {
			this._log.error(err)
			respondWithError(res, 500)
		})
	}

	onRemove (req, res) {
		if ( ! acceptsJSON(req, res)) return

		DeviceProvider.findByUDID(req.params.udid).then((device) => {
			return DeviceGroupProvider.removeDeviceFromGroup(device, req.params.groupId)
		}).then(() => {
			respondWithOK(res)
		}).catch(NotFoundError, () => {
			respondWithError(res, 404, 'Device not found.')
		}).catch((err) => {
			this._log.error(err)
			respondWithError(res, 500)
		})
	}
}
