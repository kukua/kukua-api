class BadRequestError extends Error {
	constructor (msg = 'Bad request.') {
		super(msg)
		this.statusCode = 400
	}
}
class NotFoundError extends Error {
	constructor (msg = 'Not found.') {
		super(msg)
		this.statusCode = 404
	}
}
class InternalServerError extends Error {
	constructor (msg = 'Woah! Something went wrong. We have been notified.') {
		super(msg)
		this.statusCode = 500
	}
}

module.exports = {
	BadRequestError,
	NotFoundError,
	InternalServerError,
}
