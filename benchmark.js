'use strict'
const dataChunks = require('./data');
const quic = require('./quic/app.js');
const http2 = require('./http2/app.js');
const thunk = require('thunks').thunk

// BENCHMARK SIZE
let i = 3000;
function measureTimeForSizes() {
    for(var key in dataChunks) {
        console.log(key);
        http2.measureTime(dataChunks[key], i++);
    }
}

// BENCHMARK NUMBER



// Call scripts
measureTimeForSizes();