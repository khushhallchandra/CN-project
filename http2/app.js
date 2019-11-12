'use strict'
const http2 = require('http2');
const fs = require('fs');
const ilog = require('ilog')
// ----------------------------
// ---------- Server ----------
// ----------------------------
const options = {
    key: fs.readFileSync(__dirname + '/server.key'),
    cert: fs.readFileSync(__dirname + '/server.crt'),
  };

const server = http2.createSecureServer(options);
server.on('stream', (stream, requestHeaders) => {
  stream.respond({ ':status': 200, 'content-type': 'text/plain' });
  stream.write('hello');
  stream.end('world');
});
server.listen(2000);

// ----------------------------
// ---------- Client ----------
// ----------------------------
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const client = http2.connect('https://localhost:2000');
const req = client.request({ 
    method: 'GET', 
    path: '/',
});
req.on('response', (responseHeaders) => {
    console.log(responseHeaders);
});
req.on('data', (chunk) => {
    ilog.info(`client stream ${req.id} data: ${chunk.toString()}`)
});
req.on('end', () => client.destroy());

