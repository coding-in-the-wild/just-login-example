var fs = require('fs')
var brucedown = require('brucedown')


fs.readFile('./info.md', {encoding: 'utf8'}, function (err, infoMd) {
	if (err) throw err

	brucedown(infoMd, function (err, html) {
		if (err) throw err

		fs.readFile('./indexTemplate.html', {encoding: 'utf8'}, function (err, indexHtml) {
			if (err) throw err

			var fullHtml = indexHtml.replace('<!--DOCUMENTATION_GOES_HERE-->', html)

			fs.writeFile('../static/index.html', fullHtml, function (err) {
				if (err) throw err
			})
		})
	})
})
