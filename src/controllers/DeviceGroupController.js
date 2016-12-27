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

		app.get('/deviceGroups', auth(), this.onIndex.bind(this))
		app.put('/devices/:udid([\\da-fA-F]{16})/groups/:groupId([\\da-z\\-]+)', auth(), this.onAdd.bind(this))
		app.delete('/devices/:udid([\\da-fA-F]{16})/groups/:groupId([\\da-z\\-]+)', auth(), this.onRemove.bind(this))
	}

	onIndex (req, res) {
		if ( ! acceptsJSON(req, res)) return

		DeviceGroupProvider.find().then((groups) => {
			return Promise.all(groups.map((group) => this._addIncludes(req, group)))
		}).then((groups) => {
			res.json(groups)
		}).catch((err) => {
			this._log.error(err)
			respondWithError(res)
		})
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
			respondWithError(res)
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
			respondWithError(res)
		})
	}

	_addIncludes (req, group) {
		if ( ! req.query.includes) return Promise.resolve(group)

		var includes = []

		req.query.includes.split(',').forEach((include) => {
			var udids = group.get('device_udids')
			if (include === 'devices' && Array.isArray(udids)) {
				return includes.push(
					Promise.all(udids.map((udid) => DeviceProvider.findByUDID(udid))).then((devices) => {
						group.set('devices', devices)
					})
				)
			}
		})

		return Promise.all(includes).then(() => Promise.resolve(group))
	}
}
