var Level = require('level')
Level('./mydb', function (err, db) {
	if (err) throw err
	var server = require('./server-src/index.js')
	server(db).listen(process.env.PORT || 80)
})
