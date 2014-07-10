module.exports = function tokenReader(search, matchRegex, authenticate) {
	var temp = search!=null ? search.slice(-32) : "[not given]"
	console.log("Token: '"+temp+", from: '"+search+"'")
	if (matchRegex.test(search)) {
		console.log("\tLooks like a token.")
		authenticate(search.slice(-32), function (err, addr) {
			if (err && err.invalidToken) //if token not in db
				console.log("\tToken not in db.")
			else if (err) //if some error
				console.log("\tWeird error:", addr.message)
			else //if no err (successful login)
				console.log("\tJust logged in as:"+addr)
		})
	} else {
		console.log("\tUm, that doesn't look like a token.")
	}
}