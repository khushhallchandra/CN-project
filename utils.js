'use strict'
const fs = require('fs');
const NS_PER_SEC = 1e9
const MS_PER_NS = 1e6

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

function writeToFile(testName, protoName, key, timings) {
    fs.appendFileSync(`results/${testName}/${protoName}_${key}.csv`, `${timings.contentTransfer}, ${timings.total}\n`, (err) => {
        // console.log(err);
    });
}

module.exports = {
    getTimings,
    writeToFile,
};