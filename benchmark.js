'use strict'
const dataChunks = require('./data');
const quic = require('./quic/app.js');
const http2 = require('./http2/app.js');
const http1 = require('./http1.1/app.js');
const thunk = require('thunks').thunk

// BENCHMARK SIZE
function measureTimeForSizes(proto_type) {
    let i = 7000;
    for(var key in dataChunks) {
        for(var j=0; j<50; j++) {
            proto_type.measureTime(key, dataChunks[key], 1, i++);
        }
    }   
}

// BENCHMARK SIZE - TLS
function measureTimeForSizesTLS(proto_type) {
    let i = 7000;
    for(var key in dataChunks) {
        for(var j=0; j<50; j++) {
            proto_type.measureTime("tls_" + key, dataChunks[key], 1, i++, true);
        }
    }   
}

//1,5,25,50,100,1000
var num_objects = [1,5,25,50,100,1000];
var string_objects = ["1","5","25","50","100","1000"]
//BENCHMARK NUMBER
function measureTimeForNumbers(proto_type) {
    let i = 8000;
    var data = dataChunks["txt3"]
    for(var k = 0; k < num_objects.length; k++) {
        for(var j=0; j<50; j++) {
            proto_type.measureTime("num_" + string_objects[k] + "_txt3", data, num_objects[k], i++);
        }
    }   
}


// Call scripts
// measureTimeForSizes(quic);
// measureTimeForSizesTLS(http1);
// measureTimeForSizesTLS(http2);
// thunk.delay(100000);
measureTimeForNumbers(http2);
// measureTimeForSizes();