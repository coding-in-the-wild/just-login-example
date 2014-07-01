var dnode = require('./mock.js')

dnode.continueExistingSession(13, function(err, fullApi, sessionId) {
	console.log("The server told me that my sessionid was", sessionId)
	fullApi.tryToLogIn('me@JoshDuff.com')
	fullApi.tryToLogIn('butts@JoshDuff.com')
})

dnode.createNewSession(function(err, fullApi) {
	fullApi.tryToLogIn('someoneelse@fake.com')
})

dnode.createNewSession(function(err, fullApi) {
	fullApi.tryToLogIn('MORE PERSON@fake.com')
})
