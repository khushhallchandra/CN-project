'use strict'

require('ts-node/register')
const ilog = require('ilog')
const thunk = require('thunks').thunk
const {
  Server,
  Client
} = require('../src')

var startTime, endTime;

// ---------- Server ----------
function measureTime(data_txt, tls=false){
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
                ilog.info(`server stream ${stream.id} data: ${data.toString()}`)
                stream.write(data)
                endTime = new Date();
                ilog.info(`Time taken: ${endTime - startTime}`)
            })
            .on('end', () => {
                ilog.info(`server stream ${stream.id} ended`)
                stream.end()
            })
            .on('finish', () => {
                ilog.info(`server stream ${stream.id} finished`)
            })
        })
    })

    server.listen(3000)
    .then(() => {
        ilog.info(Object.assign({ class: 'server listen' }, server.address()))
    })
    .catch(ilog.error)

    // ---------- Client ----------
    const cli = new Client()
    cli.on('error', (err) => ilog.error(Object.assign(err, { class: 'client error' })))

    thunk(function * () {
    yield cli.connect(3000)
    yield cli.ping()

    const stream = cli.request()
    stream
        .on('error', (err) => ilog.error(Object.assign(err, { class: 'client stream error' })))
        .on('data', (data) => {
        ilog.info(`client stream ${stream.id} data: ${data.toString()}`)
        })
        .on('end', () => {
        ilog.info(`client stream ${stream.id} ended`)
        cli.close()
        })
        .on('finish', () => {
        ilog.info(`client stream ${stream.id} finished`)
        })

    yield (done) => stream.write('hello, QUIC', done)

    let i = 0
    var txt = "abcd";
    while (i <= 0) {
        yield thunk.delay(100)
        startTime = new Date();
        yield (done) => stream.write(data_txt, done)
        // i++;
    }
    stream.end()

    yield (done) => cli.once('close', done)
    yield server.close()
    })(ilog.error)
}