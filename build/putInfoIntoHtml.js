const fs = require('fs')
const path = require('path')
const micromark = require('micromark')
const highlight_javascript = require('./hightlightJavascript.js')

const read = relative_path => fs.readFileSync(path.join(__dirname, relative_path), { encoding: 'utf8' })
const write = (relative_path, contents) => fs.writeFileSync(path.join(__dirname, relative_path), contents, { encoding: 'utf8' })

const info_html = micromark(read('info.md'))
const info_html_highlit = highlight_javascript(info_html)
const full_html = read('indexTemplate.html').replace('<!--DOCUMENTATION_GOES_HERE-->', info_html_highlit)
write('../static/index.html', full_html)
