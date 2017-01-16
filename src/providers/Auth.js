const providers = require('./')
const { NotFoundError } = require('../helpers/errors')

const missingHeader = 'Missing token. Please provide "Authorization: Token {token}" header.'

const methods = {
	loginUser (req, res, user) {
		if ( ! user.get('is_active')) {
			res.status(401).error('This account has been disabled.')
			return false
		}
		if ( ! user.get('is_admin')) {
			res.status(401).error('Not allowed to perform this action.')
			return false
		}

		res.setHeader('X-User-Id', user.id)
		req.user = user
		return true
	},
	middleware (req, res, next) {
		var header = req.headers.authorization

		if ( ! header || ! header.toLowerCase().startsWith('token ')) {
			return res.status(401).error(missingHeader)
		}

		providers('user').findByToken(header.substr(6))
			.then((user) => {
				if ( ! methods.loginUser(req, res, user)) return
				next()
			})
			.catch(NotFoundError, () => {
				res.status(401).error('Invalid authentication token.')
			})
	},
}

module.exports = methods
