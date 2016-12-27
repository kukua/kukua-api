const Promise = require('bluebird')
const DeviceProvider = require('../providers/Device')
const DeviceGroupProvider = require('../providers/DeviceGroup')
const auth = require('../helpers/authenticate')
const acceptsJSON = require('../helpers/acceptsJSON')
const respondWithError = require('../helpers/respondWithError')
const { NotFoundError } = require('../helpers/errors')

module.exports = class DeviceController {
	constructor (app, log) {
		//this._app = app
		this._log = log

		app.get('/devices', auth(), this.onIndex.bind(this))
		app.get('/devices/:udid([\\da-fA-F]{16})', auth(), this.onShow.bind(this))
	}

	onIndex (req, res) {
		if ( ! acceptsJSON(req, res)) return

		DeviceProvider.find().then((devices) => {
			return Promise.all(devices.map((device) => this._addIncludes(req, device)))
		}).then((devices) => {
			res.json(devices)
		}).catch((err) => {
			this._log.error(err)
			respondWithError(res)
		})
	}
	onShow (req, res) {
		if ( ! acceptsJSON(req, res)) return

		DeviceProvider.findByUDID(req.params.udid).then((device) => {
			return this._addIncludes(req, device)
		}).then((device) => {
			res.json(device)
		}).catch(NotFoundError, () => {
			respondWithError(res, 404, 'Device not found.')
		}).catch((err) => {
			this._log.error(err)
			respondWithError(res)
		})
	}

	_addIncludes (req, device) {
		if ( ! req.query.include) return Promise.resolve(device)

		var includes = []

		req.query.include.split(',').forEach((include) => {
			if (include === 'groups') {
				return includes.push(
					DeviceGroupProvider.findByDevice(device).then((groups) => {
						device.set('groups', groups)
					})
				)
			}
		})

		return Promise.all(includes).then(() => Promise.resolve(device))
	}
}
