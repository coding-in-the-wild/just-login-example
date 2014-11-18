var Level = require('level')
Level(__dirname + '/mydb', function (err, db) {
	if (err) throw err
	var server = require(__dirname + '/server-src/index.js')
	server(db).listen(process.env.PORT || 80)
})
