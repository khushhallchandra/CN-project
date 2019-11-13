'use strict'
const http2 = require('http2');
const fs = require('fs');
const utils = require('../utils.js')

function measureTime(key, data, port=2000, tls=false) {

    // ----------------------------
    // ---------- Server ----------
    // ----------------------------
    const options = {
        key: fs.readFileSync(__dirname + '/../certs/server.key'),
        cert: fs.readFileSync(__dirname + '/../certs/server.crt'),
    };

    const eventTimes = {
        startAt: process.hrtime(),
        dnsLookupAt: undefined,
        tcpConnectionAt: undefined,
        tlsHandshakeAt: undefined,
        firstByteAt: undefined,
        endAt: undefined
    }

    const server = tls ? http2.createSecureServer(options) : http2.createServer();
    server.on('connect', () => {
        eventTimes.tcpConnectionAt = process.hrtime();
    });
    server.on('stream', (stream, requestHeaders) => {
        stream.respond({ ':status': 200, 'content-type': 'text/plain' });
        stream.write(data);
        stream.end();
    });
    server.listen(port);

    // ----------------------------
    // ---------- Client ----------
    // ----------------------------
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

    const client = tls ? http2.connect(`https://localhost:${port}`) : http2.connect(`http://localhost:${port}`);
    
    client.on('error', (error) => console.log(error));

    const req = client.request({ 
        method: 'GET', 
        path: '/',
    });

    req.on('response', (responseHeaders) => {

    });

    req.once('readable', () => {
        eventTimes.firstByteAt = process.hrtime();
    });

    // req.on('data', (chunk) => {
    //     ilog.info(`client stream ${req.id} data: ${chunk.toString()}`);
    //     // console.log(eventTimes);
    // });

    let responseBody = ''
    req.on('data', (chunk) => { responseBody += chunk });

    req.on('end', () => {
        eventTimes.endAt = process.hrtime()
  
        let timings = utils.getTimings(eventTimes);
        utils.writeToFile("benchmark_size", "http2", key, timings);
        client.close();
        server.close();
    });
    

    req.on('socket', (socket) => {
        socket.on('lookup', () => {
            eventTimes.dnsLookupAt = process.hrtime()
        })
        socket.on('connect', () => {
            eventTimes.tcpConnectionAt = process.hrtime()
        })
        socket.on('secureConnect', () => {
            eventTimes.tlsHandshakeAt = process.hrtime()
        })
    });

    req.end();

}



module.exports = {
    measureTime,
};