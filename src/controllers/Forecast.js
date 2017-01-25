const _ = require('underscore')
const BaseController = require('./Base')

class ForecastController extends BaseController {
	constructor (app, providerFactory) {
		super(app, providerFactory)

		var auth = this._getProvider('auth')

		app.get('/forecasts', auth.middleware, this._onIndex.bind(this))
		app.get('/forecastLocations', auth.middleware, this._onLocationIndex.bind(this))
		app.get('/forecastLocations/:id(\\d+)', auth.middleware, this._onLocationShow.bind(this))
	}

	_onIndex (req, res) {
		var filter = this._getProvider('forecastFilter').fromRequest(req)
		var user = req.session.user

		Promise.all([
			this._canRead(user, filter),
			this._canRead(user, filter.getLocation()),
		])
			.then(() => this._getProvider('forecast').findByFilter(filter))
			.then((forecasts) => res.json(forecasts))
			.catch((err) => res.error(err))
	}
	_onLocationIndex (req, res) {
		var user = req.session.user

		this._getProvider('forecastLocation').find()
			.then((locations) => Promise.all(
				locations.map((location) => {
					return this._canRead(user, location)
						.then(() => location, () => null) // Filter out prohibited
				})
			))
			.then((locations) => _.compact(locations))
			.then((locations) => res.json(locations))
			.catch((err) => res.error(err))
	}
	_onLocationShow (req, res) {
		this._getProvider('forecastLocation').findByID(req.params.id)
			.then((location) => this._canRead(req.session.user, location))
			.then((location) => res.json(location))
			.catch((err) => res.error(err))
	}
}

module.exports = ForecastController
