var express = require('express');
var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');
var wav = require('wav');

const EXTERNAL_APP_HOST = process.env['EXTERNAL_APP_HOST'] || 'localhost';
const APP_PORT = process.env['APP_PORT'] || 3700;
const WEB_SOCK_PORT = process.env['WEB_SOCK_PORT'] || 9001;
const INTERNAL_SOCK_PORT = process.env['INTERNAL_SOCK_PORT'] || 8124;

var outFile = 'demo.wav';
var app = express();

app.set('views', __dirname + '/tpl');
app.set('view engine', 'pug');
app.engine('pug', require('pug').__express);
app.use(express.static(__dirname + '/public'))

app.get('/', function(req, res){
  res.render('index', {
	  EXTERNAL_APP_HOST: EXTERNAL_APP_HOST,
	  WEB_SOCK_PORT: WEB_SOCK_PORT
  });
});

app.listen(APP_PORT);

console.log('server open on port ' + APP_PORT);

binaryServer = BinaryServer({port: WEB_SOCK_PORT});

binaryServer.on('connection', function(client) {
  console.log('new connection');

  client.on('stream', function(stream, meta) {
    console.log('new stream');

    server = require('net').createServer((c) => {
      console.log('internal socket client');

      stream.pipe(c);

      stream.on('end', () => {
        c.end();
        console.log('internal closed connection');
      });
    });

    server.listen(INTERNAL_SOCK_PORT, () => {
      console.log('server bound');
    });
  });
});
