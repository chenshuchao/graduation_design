// Setup basic express server
var express = require('express');
var path = require('path');
var mysql = require('mysql');

function CreateMysqlConn() {
var mysql_conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'bytree94',
  database : 'smart_home'
});
  return mysql_conn;
}

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
  /*
  {"id":,
   "name":,
   "params": {
              key1 : value1,
              key2 : value2
             }
   }
  */
  var conn = CreateMysqlConn();
  console.log("ctrl_io connect");
  conn.connect();
  socket.on('device_data', function(data) {
    console.log(data);
    if (!data || !data.id || !data.name || !data.params) {
      return;
    }
    // insert or update
    var params = JSON.stringify(data.params);
    sql = 'INSERT INTO  device (id, name, params, status)' +
          ' VALUES (' + data.id +', \'' + data.name +'\', \'' + params + '\', ' + '1' + ')' + 
          ' ON DUPLICATE KEY UPDATE name = \'' + data.name + '\', params = \'' + params + '\';';
    console.log('sql: ', sql);
    conn.query(sql, function(err, rows, fields) {
      if (err) throw err;
        //web_io.sockets.emit('total_data_response', );
        web_io.sockets.emit('single_data_response', {
          id : data.id,
          name : data.name,
          params : data.params
        });
        socket.emit('device_data_response');
    });
  });
  
  socket.on('disconnect', function(data) {
    console.log("ctrl_io disconnect");
    conn.end();
  });
});

/*
* WebServer
*/
web_server.listen(web_port, function () {
  console.log('WebServer listening at port %d', web_port);
});
web_app.use(express.static(__dirname + '/public'));
web_app.get("/single", function(req, res) {
  res.sendfile(path.join(__dirname+'/template/single.html'));
});
web_app.get("/", function(req, res) {
  res.sendfile(path.join(__dirname + '/template/index.html'));
});

web_io.on('connection', function (socket) {
  console.log("web_io connect");
  var conn = CreateMysqlConn();
  conn.connect();

  socket.on('total_data_request', function(data) {
    var res = [];
    var sql = 'SELECT id, name FROM device WHERE status = 1;';
    conn.query(sql, function(err, rows, fields) {
      if (err) throw err;
      for (var i = 0; i < rows.length; i++) {
        var obj = {};
        obj["id"] = rows[i].id;
        obj["name"] = rows[i].name;
        res.push(obj);
      }
      web_io.sockets.emit('total_data_response', res);
    });
  });

  socket.on("single_data_request", function(data) {
    if (!data || !data.id) return false;
    var sql = 'SELECT name, params FROM device WHERE id = ' + data.id + ';';
    console.log("sql: ", sql);
    conn.query(sql, function(err, rows, fields) {
      if(rows.length != 1) return;
      socket.emit("single_data_response", {
        id: data.id,
        name: rows[0].name,
        params: JSON.parse(rows[0].params)
      });
    });
  });

  socket.on('disconnect', function(data) {
    console.log("web_io disconnect");
    conn.end();
  });
});

