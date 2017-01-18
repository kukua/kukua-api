const _ = require('underscore')
const Promise = require('bluebird')
const providers = require('./')
const { ForecastLocation } = require('./sequelizeModels/')
const ForecastLocationModel = require('../models/ForecastLocation')
const { NotFoundError } = require('../helpers/errors')

const methods = {
	_createModel (location) {
		var attr = location.get()

		return new ForecastLocationModel(attr, providers)
	},
	getRequestedIDs (req) {
		// &locations=123,456,...
		return _.chain((req.query.locations || '').split(','))
			// Also removes empty values, since ''.split(',') => ['']
			.filter((id) => id.match(/^[0-9]+$/))
			.uniq()
			.value()
	},
	find: () => new Promise((resolve, reject) => {
		ForecastLocation.findAll({
			order: [['id', 'ASC']],
		})
			.then((locations) => locations.map((location) => methods._createModel(location)))
			.then(resolve)
			.catch(reject)
	}),
	findByID: (id) => new Promise((resolve, reject) => {
		if (parseInt(id) != id) return reject('Invalid forecast location ID.')

		ForecastLocation.findById(id)
			.then((location) => {
				if ( ! location) throw new NotFoundError()
				return methods._createModel(location)
			})
			.then(resolve)
			.catch(reject)
	}),
}

module.exports = methods
