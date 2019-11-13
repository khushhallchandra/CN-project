'use strict'
const http = require('http');
const https = require('https');
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

    let serverFunc = (req, res) => {
        res.write(data);
        res.end();
    }

    const server = tls ? https.createServer(options, serverFunc) : http.createServer(serverFunc);

    if(tls) {
        const server = https.createServer(options, (req, res) => {
            res.write(data);
            res.end();
            server.close();
        });
        server.listen(port);
    } else {
        const server = http.createServer((req, res) => {
            res.write(data);
            res.end();
            server.close();
        });
        server.listen(port); 
    }
    

    // ----------------------------
    // ---------- Client ----------
    // ----------------------------
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

    const clientOptions = {
        host: 'localhost',
        port: port,
        method: 'GET',
    };

    let httpType = tls ? https : http;

    const req = httpType.request(clientOptions, res => {
        res.once('readable', d => {
            eventTimes.firstByteAt = process.hrtime()
        });

        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk });
        
        res.on('end', () => {
            eventTimes.endAt = process.hrtime()
            let timings = utils.getTimings(eventTimes);
            utils.writeToFile("benchmark_size", "http1", key, timings);
        });
    });
      
    req.on('error', error => {
        console.error(error);
    })
    
    req.end()

    // const client = tls ? http.connect(`https://localhost:${port}`) : http.connect(`http://localhost:${port}`);
    
    // client.on('error', (error) => console.log(error));

    // 

    // req.on('response', (responseHeaders) => {

    // });

    // req.once('readable', () => {
    //     eventTimes.firstByteAt = process.hrtime();
    // });

    // // req.on('data', (chunk) => {
    // //     ilog.info(`client stream ${req.id} data: ${chunk.toString()}`);
    // //     // console.log(eventTimes);
    // // });

    // let responseBody = ''
    // req.on('data', (chunk) => { responseBody += chunk });

    // req.on('end', () => {
    //     eventTimes.endAt = process.hrtime()
  
    //     let timings = utils.getTimings(eventTimes);
    //     utils.writeToFile("benchmark_size", "http1", key, timings);
    //     client.close();
    //     server.close();
    // });
    

    // req.on('socket', (socket) => {
    //     socket.on('lookup', () => {
    //         eventTimes.dnsLookupAt = process.hrtime()
    //     })
    //     socket.on('connect', () => {
    //         eventTimes.tcpConnectionAt = process.hrtime()
    //     })
    //     socket.on('secureConnect', () => {
    //         eventTimes.tlsHandshakeAt = process.hrtime()
    //     })
    // });

    // req.end();

}



module.exports = {
    measureTime,
};