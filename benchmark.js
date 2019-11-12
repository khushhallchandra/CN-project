'use strict'
const dataChunks = require('./data');
const quic = require('./quic/app.js');

// BENCHMARK SIZE
function measureTimeForSizes() {
    for(var key in dataChunks) {
        console.log(key);
        quic.measureTime(dataChunks[key])
    }

}

// BENCHMARK NUMBER



// Call scripts
measureTimeForSizes();