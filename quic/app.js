'use strict'

require('ts-node/register')
const fs = require('fs');
const ilog = require('ilog')
const thunk = require('thunks').thunk
const {
  Server,
  Client
} = require('../src')




// ---------- Server ----------
function measureTime(data_txt, port, tls=false){
    var startTime, endTime;
    var timeDiff=0;
    const server = new Server()
    server
    .on('error', (err) => ilog.error(Object.assign(err, { class: 'server error' })))
    .on('session', (session) => {
        // ilog.info(session)

        session
        .on('error', (err) => ilog.error(Object.assign(err, { class: 'server session error' })))
        .on('stream', (stream) => {
            // ilog.info(stream)

            stream
            .on('error', (err) => ilog.error(Object.assign(err, { class: 'server stream error' })))
            .on('data', (data) => {
                // ilog.info(`server stream ${stream.id} data: ${data.toString()}`)
                stream.write(data)
                
                // ilog.info(`Time taken: ${endTime - startTime}`)
            })
            .on('end', () => {
                // ilog.info(`server stream ${stream.id} ended`)
                stream.end()
            })
            .on('finish', () => {
                // ilog.info(`server stream ${stream.id} finished`)
            })
        })
    })

    server.listen(port)
    .then(() => {
        // ilog.info(Object.assign({ class: 'server listen' }, server.address()))
    })
    .catch(ilog.error)

    // ---------- Client ----------
    const cli = new Client()
    cli.on('error', (err) => ilog.error(Object.assign(err, { class: 'client error' })))

    thunk(function * () {
    yield cli.connect(port)
    yield cli.ping()

    const stream = cli.request()
    stream
        .on('error', (err) => ilog.error(Object.assign(err, { class: 'client stream error' })))
        .on('data', (data) => {
        // ilog.info(`client stream ${stream.id} data: ${data.toString()}`)
        })
        .on('end', () => {
        // ilog.info(`client stream ${stream.id} ended`)
        cli.close()
        })
        .on('finish', () => {
        // ilog.info(`client stream ${stream.id} finished`)
        })

    yield (done) => stream.write('hello, QUIC', done)

    let i = 0
    var txt = "abcd";
    while (i <= 0) {
        yield thunk.delay(10)
        startTime = new Date();
        yield (done) => stream.write(data_txt, done)
        i++;
    }
    stream.end()

    yield (done) => cli.once('close', done)
    yield server.close()
    endTime = new Date();
    timeDiff = endTime - startTime;
    ilog.info(`Time taken: ${timeDiff}`)
    // console.log(timeDiff);
    fs.appendFile("test.result", `${timeDiff}\n`, function(err) {
        if(err) {
            return console.log(err);
        }
        // console.log("The file was saved!");
    }); 

    })(ilog.error)
}

module.exports = {
    measureTime
};