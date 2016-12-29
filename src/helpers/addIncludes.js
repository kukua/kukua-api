const Promise = require('bluebird')
const Base = require('../models/Base')

module.exports = (req, model) => {
	if ( ! req.query.includes) return Promise.resolve(model)
	if ( ! (model instanceof Base)) return Promise.reject('Invalid model given.')

	return model.load(req.query.includes.split(',')).then(() => Promise.resolve(model))
}
