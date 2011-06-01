http = require "http"
url = require "url"

download = (link, res) ->
	console.log link.href
	
	cli = http.get {host: link.host, path: link.pathname+link.search}, (dres) ->
		if dres.headers.location
			download(url.parse(dres.headers.location), res)
		else		
			res.writeHead(dres.statusCode, dres.headers)
			dres.on "data", (chunk) -> res.write chunk
			dres.on "end", -> res.end
			
	cli.on "error", (e) -> e404(res)
	
e404 = (res) ->
	res.writeHead 404
	res.end ""
	
server = http.createServer (req, res) ->
	youtubeID = url.parse(req.url).pathname.substr(1)
	youtubeURL = url.parse("http://www.youtube.com/watch?v=" + youtubeID)
	console.log youtubeURL.href
	
	cli = http.get {host: youtubeURL.host, path: youtubeURL.pathname+youtubeURL.search}, (cres) ->
		body = ""
		cres.on "data", (chunk) -> body += chunk
		
		cres.on "end", ->
			reg = /fmt_url_map=(.*)/
			match = reg.exec(body)
			
			if(!match)
				e404(res)
			else
				link = url.parse(unescape(match[0]).split(",")[0].split("|")[1])
				download(link, res)
				
	cli.on "error", (e) -> e404(res)

server.listen process.env.PORT || 1337
console.log 'YTProxy running at http://127.0.0.1:/' + process.env.PORT || 1337