const BaseController = require('./Base')

class ForecastController extends BaseController {
	constructor (app, providerFactory) {
		super(app, providerFactory)

		var auth = this._getProvider('auth')

		app.get('/forecasts', auth.middleware, this._onIndex.bind(this))
		app.get('/forecastLocations', auth.middleware, this._onLocationIndex.bind(this))
		app.get('/forecastLocations/:id([\\d]+)', auth.middleware, this._onLocationShow.bind(this))
	}

	_onIndex (req, res) {
		var filter = this._getProvider('forecastFilter').fromRequest(req)

		this._getProvider('forecast').findByFilter(filter)
			.then((forecasts) => res.json(forecasts))
			.catch((err) => res.error(err))
	}
	_onLocationIndex (req, res) {
		this._getProvider('forecastLocation').find()
			.then((locations) => res.json(locations))
			.catch((err) => res.error(err))
	}
	_onLocationShow (req, res) {
		this._getProvider('forecastLocation').findByID(req.params.id)
			.then((location) => res.json(location))
			.catch((err) => res.error(err))
	}
}

module.exports = ForecastController
