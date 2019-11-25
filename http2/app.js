'use strict'
const http2 = require('http2');
const fs = require('fs');
const utils = require('../utils.js')

function measureTime(key, data, num_objects=1, port=2000, tls=false) {

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

    const client = tls ? http2.connect(`https://localhost:${port}`, {
        maxSessionMemory: 100000
    }) : http2.connect(`http://localhost:${port}`, {
        maxSessionMemory: 100000
    });
    

    client.on('error', (error) => console.log(error));
    let flag = true;
    let responseBody = '';
    while(num_objects > 0) {
        num_objects--;
        
        const req = client.request({ 
            method: 'GET', 
            path: '/',
        });
    
        req.on('response', (responseHeaders) => {
    
        });
    
        req.once('readable', () => {
            if(flag) {
                eventTimes.firstByteAt = process.hrtime();
                flag = false;
            }
        });
    
        // req.on('data', (chunk) => {
        //     ilog.info(`client stream ${req.id} data: ${chunk.toString()}`);
        //     // console.log(eventTimes);
        // });
    
        
        req.on('data', (chunk) => { responseBody += chunk });
    
        req.on('end', () => {
            eventTimes.endAt = process.hrtime()
        });
    
        req.end();

        
    }
  
    setTimeout(() => {
        let timings = utils.getTimings(eventTimes);
        utils.writeToFile("benchmark_size", "http2", key, timings);
        client.close()
        server.close()
    }, 20000);

}



module.exports = {
    measureTime,
};