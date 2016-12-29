module.exports = (Model, Provider) => {
	Object.keys(Provider).forEach((fn) => {
		if (typeof Provider[fn] !== 'function' || fn.startsWith('_')) return

		Model[fn] = (...args) => Provider[fn](...args)
	})
}
