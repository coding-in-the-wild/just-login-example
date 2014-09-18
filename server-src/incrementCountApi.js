function incrementCount(db, key, cb) {
	db.get(key, function(err, value) {
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
		db.put(key, count, function(err) {
			cb(err, count)
		})
	})
}


var incrementCounterIfAuthed = function(jlc, db, sessionId, cb) {
	jlc.isAuthenticated(sessionId, function (err, name) {
		if (err) {
			cb(err)
		} else if (!name) {
			cb(new Error('Name is falsey: '+(typeof name)))
		} else {
			incrementCount(db, name, function (err, globalCount) {
				if (err) {
					cb(err)
				} else {
					incrementCount(db, sessionId, function (err, sessionCount) {
						if (err) {
							cb(err)
						} else {
							cb(null, {
								globalCount: globalCount,
								sessionCount: sessionCount
							})
						}
					})
				}
			})
		}
	})
}

module.exports = function (jlc, db) {
	return {
		incrementCounterIfAuthed: incrementCounterIfAuthed.bind(null, jlc, db) //takes a session id and a callback
	}
}
