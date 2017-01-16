const Promise = require('bluebird')
const TwinBCrypt = require('twin-bcrypt')
const providers = require('./')
const UserModel = require('../models/User')
const { UnauthorizedError, NotFoundError } = require('../helpers/errors')
const { User, UserToken } = require('./sequelizeModels/')

const methods = {
	_createModel (user) {
		var attr = user.get()

		if (attr.user_tokens && attr.user_tokens.length !== 0) {
			attr.auth_token = attr.user_tokens[0].get('token')
		}

		delete attr.password
		delete attr.user_tokens

		return new UserModel(attr, providers)
	},
	findById: (id) => new Promise((resolve, reject) => {
		User.findById(id)
			.then((user) => {
				if ( ! user) throw new NotFoundError()

				resolve(methods._createModel(user))
			})
			.catch(reject)
	}),
	findByCredentials: (username, password) => new Promise((resolve, reject) => {
		if (typeof username !== 'string') return reject('Invalid username string given.')
		if (typeof password !== 'string') return reject('Invalid password string given.')

		User.findOne({
			where: {
				email: username,
			},
			include: {
				model: UserToken,
				required: true,
				order: [['updated_at', 'DESC']],
				limit: 1,
			},
		})
			.then((user) => {
				if ( ! user) throw new UnauthorizedError('Invalid credentials')

				var matches = TwinBCrypt.compareSync(password, user.get('password'))

				if ( ! matches) throw new UnauthorizedError('Invalid credentials.')

				resolve(methods._createModel(user))
			})
			.catch(reject)
	}),
	findByToken: (token) => new Promise((resolve, reject) => {
		UserToken.findOne({
			where: {
				token,
			},
			include: {
				model: User,
				required: true,
			},
		})
			.then((userToken) => {
				if ( ! userToken) throw new NotFoundError()

				resolve(methods._createModel(userToken.get('user')))
			})
			.catch(reject)
	}),
}

module.exports = methods
