'use strict'
const http2 = require('http2');
const fs = require('fs');
const ilog = require('ilog')

const NS_PER_SEC = 1e9
const MS_PER_NS = 1e6

function measureTime(data, port=2000, tls=false) {

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
  
        console.log({
          headers: req.headers,
          timings: getTimings(eventTimes),
        //   body: responseBody
        });
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

function getHrTimeDurationInMs (startTime, endTime) {
    const secondDiff = endTime[0] - startTime[0]
    const nanoSecondDiff = endTime[1] - startTime[1]
    const diffInNanoSecond = secondDiff * NS_PER_SEC + nanoSecondDiff
  
    return diffInNanoSecond / MS_PER_NS
}

function getTimings(eventTimes) {
    return {
      // There is no DNS lookup with IP address
    //   dnsLookup: eventTimes.dnsLookupAt !== undefined ?
    //     getHrTimeDurationInMs(eventTimes.startAt, eventTimes.dnsLookupAt) : undefined,
    //   tcpConnection: getHrTimeDurationInMs(eventTimes.dnsLookupAt || eventTimes.startAt, eventTimes.tcpConnectionAt),
      // There is no TLS handshake without https
    //   tlsHandshake: eventTimes.tlsHandshakeAt !== undefined ?
        // (getHrTimeDurationInMs(eventTimes.tcpConnectionAt, eventTimes.tlsHandshakeAt)) : undefined,
    //   firstByte: getHrTimeDurationInMs((eventTimes.tlsHandshakeAt || eventTimes.tcpConnectionAt), eventTimes.firstByteAt),
      contentTransfer: getHrTimeDurationInMs(eventTimes.firstByteAt, eventTimes.endAt),
      total: getHrTimeDurationInMs(eventTimes.startAt, eventTimes.endAt)
    }
  }

module.exports = {
    measureTime,
};