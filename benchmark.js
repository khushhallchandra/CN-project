'use strict'
const dataChunks = require('./data');
const quic = require('./quic/app.js');
const http2 = require('./http2/app.js');
const http1 = require('./http1.1/app.js');
const thunk = require('thunks').thunk

// BENCHMARK SIZE
let i = 7000;
function measureTimeForSizes(proto_type) {
    for(var key in dataChunks) {
        for(var j=0; j<50; j++) {
            proto_type.measureTime(key, dataChunks[key], i++);
        }
    }   
}

// BENCHMARK NUMBER



// Call scripts
measureTimeForSizes(quic);
// measureTimeForSizes(http1);
// measureTimeForSizes(http2);
// thunk.delay(100000);

// measureTimeForSizes();