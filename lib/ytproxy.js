(function() {
  var download, e404, http, server, url;
  http = require("http");
  url = require("url");
  download = function(link, res) {
    var cli;
    console.log(link.href);
    cli = http.get({
      host: link.host,
      path: link.pathname + link.search
    }, function(dres) {
      if (dres.headers.location) {
        return download(url.parse(dres.headers.location), res);
      } else {
        res.writeHead(dres.statusCode, dres.headers);
        dres.on("data", function(chunk) {
          return res.write(chunk);
        });
        return dres.on("end", function() {
          return res.end;
        });
      }
    });
    return cli.on("error", function(e) {
      return e404(res);
    });
  };
  e404 = function(res) {
    res.writeHead(404);
    return res.end("");
  };
  server = http.createServer(function(req, res) {
    var cli, youtubeID, youtubeURL;
    youtubeID = url.parse(req.url).pathname.substr(1);
    youtubeURL = url.parse("http://www.youtube.com/watch?v=" + youtubeID);
    console.log(youtubeURL.href);
    cli = http.get({
      host: youtubeURL.host,
      path: youtubeURL.pathname + youtubeURL.search
    }, function(cres) {
      var body;
      body = "";
      cres.on("data", function(chunk) {
        return body += chunk;
      });
      return cres.on("end", function() {
        var link, match, reg;
        reg = /fmt_url_map=(.*)/;
        match = reg.exec(body);
        if (!match) {
          return e404(res);
        } else {
          link = url.parse(unescape(match[0]).split(",")[0].split("|")[1]);
          return download(link, res);
        }
      });
    });
    return cli.on("error", function(e) {
      return e404(res);
    });
  });
  server.listen(1337);
  console.log('YTProxy running at http://127.0.0.1:1337/');
}).call(this);
