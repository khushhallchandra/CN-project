import quic from 'node-quic'

const port    = 1234
const address = '127.0.0.1'
 
// First we listen.
quic.listen(port, address)
  .onData((data, stream, buffer) => {
    const parsedData = JSON.parse(data)
 
    console.log(parsedData) // { hello: 'world!' }
 
    // Once the data is received and logged, we'll send it right back
    stream.write(parsedData)
  })
 
// Now we send the data to the server.
quic.send(port, address, { hello: 'world!' })
  .onData(data => {
 
    // This is the data that was sent right back
    const parsedData = JSON.parse(data)
    console.log(parsedData) // { hello: 'world!' }
 
    // now we can stop the server from listening if we want this to be a one-off
    quic.stopListening()
  })