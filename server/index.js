// Setup basic express server
var express = require('express');
var mysql = require('mysql');
var mysql_conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'bytree94',
  database : 'smart_home'
});

var ctrl_app = express();
var ctrl_server = require('http').createServer(ctrl_app);
var ctrl_io = require('socket.io')(ctrl_server);
var ctrl_port = process.env.PORT || 8070;

var web_app = express();
var web_server = require('http').createServer(web_app);
var web_io = require('socket.io')(web_server);
var web_port = process.env.PORT || 8080;

ctrl_server.listen(ctrl_port, function () {
  console.log('CtrlServer listening at port %d', ctrl_port);
});
//ctrl_app.use(express.static(__dirname + '/public'));

ctrl_io.on('connection', function (socket) {
  // {"id":, "password":, "temperature":}
  socket.on('device_data', function(data) {
    console.log(data);
    if (!data || !data.id || !data.password || !data.temperature) {
      return;
    }
    mysql_conn.connect();
    var sql = 'SELECT password FROM device where id = ' + data.id + ';';
    mysql_conn.query(sql, function(err, rows, fields) {
      if (err) throw err;
      console.log('The solution is: ', rows[0].password);
      if (rows[0].password != data.password) return;

      sql = 'UPDATE device SET temperature = ' + data.temperature + ' where id = ' + data.id +';';
      console.log('sql: ', sql);
      mysql_conn.query(sql, function(err, rows) {
        if (err) throw err;
        web_io.sockets.emit('refresh', {text:data.text});
      });
    });
    //mysql_conn.end();
  });
  
  socket.on('disconnect', function(data) {
  });
});


/*
* WebServer
*/
web_server.listen(web_port, function () {
  console.log('WebServer listening at port %d', web_port);
});
web_app.use(express.static(__dirname + '/public'));

web_io.on('connection', function (socket) {
  socket.on('chat', function(data) {
    mysql_conn.connect();
    mysql_conn.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
      if (err) throw err;
      console.log('The solution is: ', rows[0].solution);
    });
    mysql_conn.end(); 
    web_io.sockets.emit('chat', {text:data.text});
  });

  socket.on('disconnect', function(data) {
  });
});


