class BadRequestError extends Error {
	constructor (msg = 'Bad request.') {
		super(msg)
		this.status = 400
	}
}
class NotFoundError extends Error {
	constructor (msg = 'Not found.') {
		super(msg)
		this.status = 404
	}
}
class InternalServerError extends Error {
	constructor (msg = 'Woah! Something went wrong. We have been notified.') {
		super(msg)
		this.status = 500
	}
}

module.exports = {
	BadRequestError,
	NotFoundError,
	InternalServerError,
}
