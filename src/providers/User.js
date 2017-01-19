const Promise = require('bluebird')
const TwinBCrypt = require('twin-bcrypt')
const BaseProvider = require('./Base')
const UserModel = require('../models/User')
const { UnauthorizedError, NotFoundError } = require('../helpers/errors')
const { User, UserToken } = require('./sequelizeModels/')

class UserProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		this._UserModel = UserModel
		this._User = User
		this._UserToken = UserToken
	}

	_createModel (user) {
		var attr = user.get()

		if (attr.user_tokens && attr.user_tokens.length !== 0) {
			attr.auth_token = attr.user_tokens[0].get('token')
		}

		delete attr.password
		delete attr.user_tokens

		return new (this._UserModel)(attr, this._getProviderFactory())
	}

	findByID (id) {
		return new Promise((resolve, reject) => {
			this._User.findById(id)
				.then((user) => {
					if ( ! user) throw new NotFoundError()
					resolve(this._createModel(user))
				})
				.catch(reject)
		})
	}
	findByCredentials (username, password) {
		return new Promise((resolve, reject) => {
			if (typeof username !== 'string') {
				return reject('Invalid username string given.')
			}
			if (typeof password !== 'string') {
				return reject('Invalid password string given.')
			}

			this._User.findOne({
				where: {
					email: username,
				},
				include: {
					model: this._UserToken,
					required: true,
					order: [['updated_at', 'DESC']],
					limit: 1,
				},
			})
				.then((user) => {
					if ( ! user) {
						throw new UnauthorizedError('Invalid credentials')
					}

					var matches = TwinBCrypt.compareSync(password, user.get('password'))

					if ( ! matches) {
						throw new UnauthorizedError('Invalid credentials.')
					}

					resolve(this._createModel(user))
				})
				.catch(reject)
		})
	}
	findByToken (token) {
		return new Promise((resolve, reject) => {
			this._UserToken.findOne({
				where: {
					token,
				},
				include: {
					model: this._User,
					required: true,
				},
			})
				.then((userToken) => {
					if ( ! userToken) throw new NotFoundError()
					resolve(this._createModel(userToken.get('user')))
				})
				.catch(reject)
		})
	}
}

module.exports = UserProvider
