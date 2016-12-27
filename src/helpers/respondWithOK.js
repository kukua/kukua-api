module.exports = (res, data = {}) => res.json(Object.assign({
	statusCode: 200,
	message: 'OK',
}, data))
