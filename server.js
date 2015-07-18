var Level = require('level')
var config = require('./config.json')
var Server = require('./server-src/index.js')

var port = process.argv[2] || config.port || 80

Level(__dirname + '/mydb', function (err, db) {
	if (err) throw err

	var server = Server(db)
	server.listen(port)

	console.log('Server listening on port ' + port)
})
