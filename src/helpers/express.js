const express = require('express')

// Custom responses
express.response.error = function (err) {
	this.req.log.error(err)

	if ( ! (err instanceof Error)) {
		err = new Error(err)
	}
	if (err.statusCode) {
		this.status(err.statusCode)
	} else if (this.statusCode === 200) {
		this.status(500)
	}

	var data = {
		statusCode: this.statusCode,
		message: err.message,
	}

	if (typeof err.data === 'object') {
		data = Object.assign(data, err.data)
	}

	this.json(data)
}
express.response.ok = function (data = {}) {
	this.status(200).json(Object.assign({
		statusCode: 200,
		message: 'OK',
	}, data))
}

module.exports = express
