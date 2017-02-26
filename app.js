var express = require('express');
var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');
var wav = require('wav');
var net = require('net');

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

(() => {
  var web_socket_client = null;
  var web_socket_stream = null;
  var socket_client = null;

  var web_socket_client_cb = (client) => {
    console.log('new connection');
    web_socket_client = client;

    web_socket_client.on('stream', function(stream, meta) {
      console.log('new stream');
      web_socket_stream = stream;

      step();
    });
  };

  var socket_client_cb = (client) => {
    console.log('internal socket client');
    socket_client = client;

    step();
  };

  var step = (() => {
    return () => {
      if (web_socket_stream == null || web_socket_client == null ||
          socket_client == null) {
        return;
      }

      web_socket_stream.pipe(socket_client);

      web_socket_stream.on('end', () => {
        socket_client.end();
        console.log('internal closed connection');
      });
    }
  })();

  internal_server = net.createServer(socket_client_cb);
  internal_server.listen(INTERNAL_SOCK_PORT, EXTERNAL_APP_HOST, () => {
    console.log('internal server bound');
  });

  binaryServer = BinaryServer({host: EXTERNAL_APP_HOST, port: WEB_SOCK_PORT});
  binaryServer.on('connection', web_socket_client_cb);
})()
