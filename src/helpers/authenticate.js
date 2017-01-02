const User = require('../models/User')
const { NotFoundError } = require('./errors')

const missingHeader = 'No token given. Please provide \'Authorization: Token {token}\' header.'

module.exports = (isAdmin = false) => (req, res, next) => {
	var header = req.headers.authorization

	if ( ! header || ! header.toLowerCase().startsWith('token ')) {
		return res.status(401).error(missingHeader)
	}

	User.findByToken(header.substr(6)).then((user) => {
		if ( ! user.get('is_active')) {
			return res.status(401).error('This account has been disabled.')
		}
		if (isAdmin && ! user.get('is_admin')) {
			return res.status(401).error('Not allowed to perform this action.')
		}

		req.user = user
		next()
	}).catch(NotFoundError, () => {
		res.status(401).error('Invalid token')
	})
}
