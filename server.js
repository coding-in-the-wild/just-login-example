const levelup = require('levelup')
const encode = require('encoding-down')
const jsondown = require('jsondown')

const config = require('./config.json')
const Server = require('./server-src/index.js')

const port = process.argv[2] || config.port || 80

levelup(encode(jsondown('./mydb.json')), function (err, db) {
	if (err) throw err

	const server = Server(db)
	server.listen(port)

	console.log('Server listening on port ' + port)
})
