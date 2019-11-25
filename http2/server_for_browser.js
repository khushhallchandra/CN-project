'use strict'
const http2 = require('http2');
const fs = require('fs');
const mime = require('mime');

    const sendFile = (stream, fileName) => {
        const fd = fs.openSync(fileName, "r");
        const stat = fs.fstatSync(fd);
        const headers = {
          "content-length": stat.size,
          "last-modified": stat.mtime.toUTCString(),
          "content-type": mime.getType(fileName)
        };
        stream.respondWithFD(fd, headers);
        stream.on("close", () => {
          console.log("closing file", fileName);
          fs.closeSync(fd);
        });
    };

    const pushFile = (stream, path, fileName) => {
        stream.pushStream({ ":path": path }, (err, pushStream) => {
            if (err) {
                throw err;
            }
            // Client has the file cached
            pushStream.on('error', (err) => {
                const isRefusedStream = err.code === 'ERR_HTTP2_STREAM_ERROR' &&
                                        pushStream.rstCode === http2.constants.NGHTTP2_REFUSED_STREAM;
                if (!isRefusedStream) {
                    throw err;
                }
            });
            sendFile(pushStream, fileName);
        });
    };

    const options = {
        key: fs.readFileSync(__dirname + '/../certs/server.key'),
        cert: fs.readFileSync(__dirname + '/../certs/server.crt'),
    };

    const server = http2.createSecureServer(options);
    server.on('stream', (stream, requestHeaders) => {
        if(requestHeaders[":path"].startsWith('/images')) {
            stream.respond({ ':status': 200, 'content-type': 'image/png' }); 
            var img = fs.readFileSync(__dirname + '/../static' + requestHeaders[":path"]);
            stream.end(img);
            // push all files in images directory
            // const imageFiles = fs.readdirSync(__dirname + '/../static/images');
            // for (let i = 0; i < imageFiles.length; i++) {
            //     const fileName = __dirname + '/../static/images/' + imageFiles[i];
            //     const path = '/images/' + imageFiles[i];
            //     pushFile(stream, path, fileName);
            // }
        } 
    });
    server.listen(5001);
