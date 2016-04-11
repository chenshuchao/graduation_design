$(function() {
  var socket = io();
  socket.on('single_data_response', function(data) {
    console.log(data);
    var arr = [];
    var params = data["params"];
    for (var key in params) {
      if(!params.hasOwnProperty(key)) continue;
      var obj = {
        key: key,
        value: params[key]
      }
      arr.push(obj);
    }
    $('#device_id').html(data["id"]);
    $('#device_name').html(data["name"]);
    var html = joinData(arr);
    $('#table_body').html(html);
  });
  var cur_url = window.location.href;
  var device_id = getParameterByName("id", cur_url);
  requestSingle(device_id);
  
  function requestSingle(id) {
    socket.emit('single_data_request', {
      id : id
    }); 
  }
  function joinData(arr) {
    var res = ''; 
    for (var i = 0; i < arr.length; i++) {
      res +=
        '<tr>' +
          '<td>' + arr[i].key + '</td>' +
          '<td>' + arr[i].value + '</td>' +
        '</tr>';
    }   
    return res;
  }
  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
});
