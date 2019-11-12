'use strict'
const dataChunks = require('./data');
const quic = require('./quic/app.js');
const http2 = require('./http2/app.js');
const thunk = require('thunks').thunk

// BENCHMARK SIZE
let i = 3000;
function measureTimeForSizes(proto_types) {
    for(var key in dataChunks) {
        // console.log(key);
        proto_types.measureTime(dataChunks[key], i++);
    }   
}

// BENCHMARK NUMBER



// Call scripts
// measureTimeForSizes(quic);
// thunk.delay(100000);
measureTimeForSizes(http2);
// measureTimeForSizes();