'use strict'
const dataChunks = require('./data');
const quic = require('./quic/app.js');
const thunk = require('thunks').thunk

// BENCHMARK SIZE
let i = 3000;
function measureTimeForSizes() {
    for(var key in dataChunks) {
        console.log(key);
        let j = 0
        while (j < 10) {
        quic.measureTime(dataChunks[key], i++);
        thunk.delay(10);//
        j++;
        }
    }
}

// BENCHMARK NUMBER



// Call scripts
measureTimeForSizes();