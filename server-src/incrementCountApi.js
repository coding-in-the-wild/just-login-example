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


var incrementCounterIfAuthed = function(jlc, clickCountDb, sessionCountDb, sessionId, cb) {
	jlc.isAuthenticated(sessionId, function (err, name) {
		if (err) {
			cb(err)
		} else if (!name) {
			cb(new Error('Name is falsey: '+(typeof name)))
		} else {
			incrementCount(clickCountDb, name, function (err, globalCount) {
				if (err) {
					cb(err)
				} else {
					incrementCount(sessionCountDb, sessionId, function (err, sessionCount) {
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
	var globalCountDb = db.sublevel('global-click-counting') //hopefully sublevel has already been run on this db :P
	var sessionCountDb = db.sublevel('session-click-counting')
	return { //incrementCounterIfAuthed() takes a sessionId and callback
		incrementCounterIfAuthed: incrementCounterIfAuthed.bind(null, jlc, globalCountDb, sessionCountDb)
	}
}
