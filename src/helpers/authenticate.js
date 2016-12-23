//const User = require('../models/User')
//const respondWithError = require('./respondWithError')

module.exports = (/*isAdmin = false*/) => (req, res, next) => {
	next()
	/*
	var header = req.headers.authorization

	if ( ! header || ! header.toLowerCase().startsWith('token ')) {
		var message = 'No token given. Please supply \'Authorization: Token {token}\' header.'
		return respondWithError(res, 401, message)
	}

	User.findOne({
		where: {
			auth_token: header.substr(6)
		},
	}).then((user) => {
		if ( ! user) {
			return respondWithError(res, 401, 'Invalid token.')
		}
		if ( ! user.get('is_active')) {
			return respondWithError(res, 401, 'This account has been disabled.')
		}
		if (isAdmin && ! user.get('is_admin')) {
			return respondWithError(res, 401, 'Not allowed to perform this action.')
		}

		req.user = user
		next()
	})
	*/
}
