'use strict'
const http2 = require('http2');
const fs = require('fs');
const utils = require('../utils.js')


    // ----------------------------
    // ---------- Server ----------
    // ----------------------------
    const options = {
        key: fs.readFileSync(__dirname + '/../certs/server.key'),
        cert: fs.readFileSync(__dirname + '/../certs/server.crt'),
    };

    const server = http2.createSecureServer(options);
    server.on('stream', (stream, requestHeaders) => {
        stream.respond({ ':status': 200, 'content-type': 'text/plain' });
        stream.write("Running on HTTP/2");
        stream.end();
    });
    server.listen(5000);

