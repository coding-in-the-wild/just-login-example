var Ractive = require('ractive')
var EventEmitter = require('events').EventEmitter

module.exports = function(checkAuthentication) {
	var emitter = new EventEmitter()
	var state = {
		globalNumberOfTimes: 0,
		sessionNumberOfTimes: 0,
		loggedIn: true
	}

	var ractive = new Ractive({
		el: 'the-place-where-the-other-stuff-goes',
		template: '#authenticated-template',
		data: state,
		magic: true
	})

	function checkAuthentication() {
		emitter.emit('check')
	}

	ractive.on({
		checkAuthentication: checkAuthentication
	})

	emitter.on('countUpdated', function (newCounts) {
		state.globalNumberOfTimes = newCounts.globalCount
		state.sessionNumberOfTimes = newCounts.sessionCount
	})

	emitter.on('notAuthenticated', function() {
		state.loggedIn = false
	})

	emitter.on('authenticate', function() {
		state.loggedIn = true
	})

	return emitter
}
