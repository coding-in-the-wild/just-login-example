var fs = require('fs')
var brucedown = require('brucedown')
var path = require('path')

var filePath = path.join(__dirname, 'info.md')
fs.readFile(filePath, {encoding: 'utf8'}, function (err, infoMd) {
	if (err) throw err

	brucedown(infoMd, function (err, html) {
		if (err) throw err

		filePath = path.join(__dirname, 'indexTemplate.html')
		fs.readFile(filePath, {encoding: 'utf8'}, function (err, indexHtml) {
			if (err) throw err

			var fullHtml = indexHtml.replace('<!--DOCUMENTATION_GOES_HERE-->', html)

			filePath = path.join(__dirname, '../static/index.html')
			fs.writeFile(filePath, fullHtml, function (err) {
				if (err) throw err
			})
		})
	})
})
