const _ = require('underscore')
const Promise = require('bluebird')
const BaseProvider = require('./Base')
const ForecastLocationModel = require('../models/ForecastLocation')
const { NotFoundError } = require('../helpers/errors')

class ForecastLocationProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		this._ForecastLocationModel = ForecastLocationModel

		var sequelizeModel = this._getProvider('sequelizeModel')
		this._ForecastLocation = sequelizeModel.getModel('ForecastLocation')
	}

	get key () { return 'forecastLocation' }

	_createModel (location) {
		var attr = location.get()

		return new (this._ForecastLocationModel)(attr, this._getProviderFactory())
	}

	getRequestedIDs (req) {
		// &locations=123,456,...
		return _.chain((req.query.locations || '').split(','))
			// Also removes empty values, since ''.split(',') => ['']
			.filter((id) => id.match(/^[0-9]+$/))
			.uniq()
			.value()
	}
	find () {
		return new Promise((resolve, reject) => {
			this._ForecastLocation.findAll({
				order: [['id', 'ASC']],
			})
				.then((locations) => locations.map((location) => this._createModel(location)))
				.then(resolve)
				.catch(reject)
		})
	}
	findByID (id) {
		return new Promise((resolve, reject) => {
			if (parseInt(id) != id) {
				return reject('Invalid forecast location ID.')
			}

			this._ForecastLocation.findById(id)
				.then((location) => {
					if ( ! location) throw new NotFoundError()
					return this._createModel(location)
				})
				.then(resolve)
				.catch(reject)
		})
	}
}

module.exports = ForecastLocationProvider
