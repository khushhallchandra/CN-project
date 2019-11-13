'use strict'
const http = require('http');
const https = require('https');
const fs = require('fs');
const utils = require('../utils.js')

    // ----------------------------
    // ---------- Server ----------
    // ----------------------------
    const options = {
        key: fs.readFileSync(__dirname + '/../certs/server.key'),
        cert: fs.readFileSync(__dirname + '/../certs/server.crt'),
    };


    const server = https.createServer(options, (req, res) => {
        res.write("Running on HTTP/1.1");
        res.end();
    });
    server.listen(5000);
    

    