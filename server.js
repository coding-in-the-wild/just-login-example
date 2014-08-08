var Level = require('level')
var db = Level('./mydb')
var server = require('./server-src/index.js')
server(db).listen(9999)
