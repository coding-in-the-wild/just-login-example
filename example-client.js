var domready = require('domready');
var shoe = require('shoe');
var dnode = require('dnode');

console.log("running script");

domready(function () {
	var stream = shoe('/dnode');
	
	var d = dnode();
	d.on('remote', function (remote) {
		console.log("successful connection");
		if (!remote) console.log("REMOTE IS UNDEFINED THIS IS BAD!!!",remote);
		else console.log('this is remote:',remote);
		remote.createNewSession(function (e, a) {
			console.log("create new session initiated")
			if (!e) {
				console.log("api:", a);
				a.isAuthenticated(function(e, a) {
					if (!e) {
						console.log("Who is logged in:", a);
					} else {
						console.log("err:", e);
					}
				})
			} else {
				console.log("err:", e);
			}
		});
	});
	d.pipe(stream).pipe(d);
	//d.end(); //NOOOOOOOOOO!!!!!!
})
