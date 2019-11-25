'use strict'
const https = require('https');
const fs = require('fs');
const url = require('url')
const mime = require('mime');

    const options = {
        key: fs.readFileSync(__dirname + '/../certs/server.key'),
        cert: fs.readFileSync(__dirname + '/../certs/server.crt'),
    };


    const server = https.createServer(options, (req, res) => {
        var request = url.parse(req.url, true);
        if(request.pathname.startsWith('/images')) {
            const fileName = __dirname + '/../static' + request.pathname;
            res.writeHead(200, {'Content-Type': mime.getType(fileName) });
            var img = fs.readFileSync(fileName);
            res.end(img, 'binary');
        } else {
            res.end("Running on HTTP/1.1");
        }
    });
    server.listen(5000);
    

    