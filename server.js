var Level = require('level')
var config = require('confuse')().justLogin
var Server = require('./server-src/index.js')

var PORT = process.argv[2] || config.port || 80

Level(__dirname + '/mydb', function (err, db) {
	if (err) throw err

	var server = Server(db)
	server.listen(PORT)

	console.log('Server listening on port ' + PORT)
})
