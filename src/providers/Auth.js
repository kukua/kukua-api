const BaseProvider = require('./Base')
const { UnauthorizedError, NotFoundError } = require('../helpers/errors')

class AuthProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		this._missingHeader = 'Missing token. Please provide "X-Auth-Token: {token}" header.'
	}

	loginUser (req, res, user) {
		if ( ! user.get('is_active')) {
			throw new UnauthorizedError('This account has been disabled.')
		}

		res.setHeader('X-User-Id', user.id)
		req.session.user = user
		return user
	}

	get middleware () {
		return this._middleware.bind(this)
	}

	_middleware (req, res, next) {
		var token = req.headers['x-auth-token']

		if ( ! token) return res.status(401).error(this._missingHeader)

		this._getProvider('user').findByToken(token.toLowerCase())
			.then((user) => this.loginUser(req, res, user))
			.then(() => next())
			.catch(NotFoundError, () => {
				res.status(401).error('Invalid authentication token.')
			})
	}
}

module.exports = AuthProvider
