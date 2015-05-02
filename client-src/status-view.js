var Ractive = require('ractive')
var EventEmitter = require('events').EventEmitter

var views = {
	empty:    0,
	badEmail:  1,
	debounced: 2,
	loggedIn:  3,
	loggedOut: 4
}

module.exports = function() {
	var emitter = new EventEmitter()
	var state = {
		globalNumberOfTimes: 0,
		sessionNumberOfTimes: 0,
		debounceRemaining: "",
		badEmail: "",
		view: views.empty
	}

	var ractive = new Ractive({
		el: 'status-view',
		template: '#status-template',
		data: state
		//magic: true
	})

	function checkAuthentication() {
		emitter.emit('check')
	}

	ractive.on({
		checkAuthentication: checkAuthentication
	})

	emitter.on('countUpdated', function (newCounts) {
		ractive.set({
			globalNumberOfTimes: newCounts.globalCount,
			sessionNumberOfTimes: newCounts.sessionCount
		})
	})

	emitter.on('loaded', function () {
		ractive.set('view', views.empty)
	})

	emitter.on('badEmail', function (email) {
		ractive.set({
			badEmail: email,
			view: views.badEmail
		})
		setTimeout(function () {
			if (ractive.get('view') === views.badEmail) {
				ractive.set('view', views.empty)
			}
		}, 5000)
	})

	emitter.on('debounce', function (remaining) {
		ractive.set({
			debounceRemaining: remaining,
			view: views.debounced
		})
	})

	emitter.on('notAuthenticated', function() {
		ractive.set('view', views.loggedOut)
	})

	emitter.on('authenticated', function() {
		ractive.set('view', views.loggedIn)
	})

	return emitter
}
