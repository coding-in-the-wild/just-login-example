var client = require('just-login-client')
var classes = require('dom-classes')
var on = require('dom-event')

var emitter = client(function (err, api, sessionId) {
	if (err) {
		console.log(err.message)
	} else {
		api.isAuthenticated(function(err, name) {
			console.log("got back", err, name)
			if (name) {
				alert("oh hey you were logged in already as " + name)
			} else {
				var btn = document.getElementById('login-button')
				classes.remove(btn, 'pure-button-disabled')

				on(btn, 'click', function() {
					var emailAddress = document.getElementById('login-email-address').value
					api.beginAuthentication(emailAddress, function(err, obj) {
						console.log(err, obj)
					})
				})
			}
		})
	}
})

emitter.on('authenticated', function(name) {
	alert("You're logged in as " + name)
})

//emitter.on('continue session')