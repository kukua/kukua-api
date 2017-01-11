const User = require('../models/User')
const { NotFoundError } = require('./errors')

const missingHeader = 'No token given. Please provide \'Authorization: Token {token}\' header.'

function loginUser (req, res, user, isAdmin = false) {
	if ( ! user.get('is_active')) {
		res.status(401).error('This account has been disabled.')
		return false
	}
	if (isAdmin && ! user.get('is_admin')) {
		res.status(401).error('Not allowed to perform this action.')
		return false
	}

	res.setHeader('X-User-Id', user.id)
	req.user = user
	return true
}

function authenticate (isAdmin = false) {
	return (req, res, next) => {
		var header = req.headers.authorization

		if ( ! header || ! header.toLowerCase().startsWith('token ')) {
			return res.status(401).error(missingHeader)
		}

		User.findByToken(header.substr(6)).then((user) => {
			if ( ! loginUser(req, res, user, isAdmin)) return

			next()
		}).catch(NotFoundError, () => {
			res.status(401).error('Invalid authentication token.')
		})
	}
}

authenticate.loginUser = loginUser

module.exports = authenticate
