const Promise = require('bluebird')
const Sequelize = require('sequelize')
const sequelize = require('../helpers/sequelize')('concava')
const { NotFoundError } = require('../helpers/errors')
const UserModel = require('../models/User')
const UserToken = require('./_UserToken').SequelizeModel

var User = sequelize.define('user', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
	},
	name: Sequelize.STRING,
	email: Sequelize.STRING,
	password: Sequelize.STRING,
	is_active: Sequelize.BOOLEAN,
	is_admin: Sequelize.BOOLEAN,
	last_login: Sequelize.DATE,
})

User.hasMany(UserToken)
UserToken.belongsTo(User)

const createModel = (user) => {
	var attr = user.get()

	delete attr.password

	return new UserModel(attr)
}

module.exports = {
	SequelizeModel: User,

	findById: (id) => new Promise((resolve, reject) => {
		User.findById(id).then((user) => {
			if ( ! user) throw new NotFoundError()

			resolve(createModel(user))
		}).catch(reject)
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
		}).then((userToken) => {
			if ( ! userToken) throw new NotFoundError()

			resolve(createModel(userToken.get('user')))
		}).catch(reject)
	}),
}
