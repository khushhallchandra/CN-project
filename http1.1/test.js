var http = require('http');
var fs = require('fs');

function send_data(data, port_number, use_SSL) {

  if(use_SSL == true){

    const https = require('https');
    const options1 = {
      key: fs.readFileSync('certs/server.key'),
      cert: fs.readFileSync('certs/server.crt'),
    };

    var server = https.createServer(options1, function (req, res) { 
      
      if (req.method === "GET") {
          res.writeHead(200, { "Content-Type": "text/html" });
          fs.createReadStream("./public/form.html", "UTF-8").pipe(res);
      } else if (req.method === "POST") {

        var d = new Date();
        var second = d.getTime();
    
        var body = "";
        req.on("data", function (chunk) {
            body += chunk;
        });

        req.on("end", function(){
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(body);
        });
        
        console.log(second - first)
        sum += (second - first)
        len += 1

      }

    }).listen(port_number);

    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

    const options = {
      hostname: '127.0.0.1',
      port: port_number,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }
  
    const req = https.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`)

      res.on('data', (d) => {
        process.stdout.write(d)
      })
    })

    req.on('error', (error) => {
      console.error(error)
    })
    var d = new Date();
    
    var first = d.getTime();
    req.write(data);
    

    req.end()

  }
  else{

    var server = http.createServer(function (req, res) {

      if (req.method === "GET") {
          res.writeHead(200, { "Content-Type": "text/html" });
          fs.createReadStream("./public/form.html", "UTF-8").pipe(res);
      } else if (req.method === "POST") {
          
          var d = new Date();
          var second = d.getTime();
          console.log(second - first)

          var body = "";
          req.on("data", function (chunk) {
              body += chunk;
          });
  
          req.on("end", function(){
              res.writeHead(200, { "Content-Type": "text/html" });
              res.end(body);
          });
      }
  
    }).listen(port_number);

    const options1 = {
      hostname: '127.0.0.1',
      port: port_number,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }

    const req = http.request(options1, (res) => {
      console.log(`statusCode: ${res.statusCode}`)

      res.on('data', (d) => {
        process.stdout.write(d)
      })
    })

    req.on('error', (error) => {
      console.error(error)
    })
    var first = d.getTime();
    req.write(data)
    req.end()
  }
}

send_data("Hello baby", 3000, true)
