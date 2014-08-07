var checkIfAuthedAndAddCount = function(jlc, db, sessionId, cb) {
	jlc.isAuthenticated(sessionId, function (err, name) {
		if (err || !name) {
			return cb(err, name)
		}
		db.get(name, function(err, value) {
			var count
			if (err && err.notFound) {
				count = 0
			} else if (err) {
				return cb(err)
			} else {
				count = parseInt(value)
			}

			if (isNaN(count)) {
				count = 1
			} else {
				count = count + 1
			}
			db.put(name, count, function(err) {
				cb(err, count)
			})
		})
	})
}

module.exports = function (jlc, db) {
	return {
		checkAuthenticationStatusAndIncrementCounter: checkIfAuthedAndAddCount.bind(null, jlc, db) //takes a session id and a callback
	}
}
