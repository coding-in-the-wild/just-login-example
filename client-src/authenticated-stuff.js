var Ractive = require('ractive')
var EventEmitter = require('events').EventEmitter

var views = {
	loaded:    0,
	badEmail:  1,
	debounced: 2,
	loggedIn:  3,
	loggedOut: 4
}

module.exports = function(checkAuthentication) {
	var emitter = new EventEmitter()
	var state = {
		globalNumberOfTimes: 0,
		sessionNumberOfTimes: 0,
		debounceRemaining: "",
		badEmail: "",
		view: views.loaded,
		apostrophe: "'"
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

	emitter.on('badEmail', function (email) {
		state.badEmail = email
		state.view = views.badEmail
	})

	emitter.on('debounce', function (remaining) {
		state.debounceRemaining = remaining
		state.view = views.debounced
	})

	emitter.on('notAuthenticated', function() {
		state.view = views.loggedOut
	})

	emitter.on('authenticated', function() {
		state.view = views.loggedIn
	})

	return emitter
}
