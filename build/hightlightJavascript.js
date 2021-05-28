const hljs = require('highlight.js/lib/core')
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'))

module.exports = function(html) {
	return html.replace(/(<pre><code class="language-js">)([\s\S]+?)(<\/code><\/pre>)/g, function(_, start_html, js_source, end_html) {
		const highlit_js_html = hljs.highlight(js_source, { language: 'javascript' }).value
		return start_html + highlit_js_html + end_html
	})
}
