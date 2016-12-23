module.exports = (
	res,
	statusCode = 500,
	message = 'Woah! Something went wrong. We have been notified.'
) => {
	res.status(statusCode).send({
		error: { statusCode, message },
	})
}
