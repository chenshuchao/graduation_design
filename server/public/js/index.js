$(function() {
  var socket = io();
  socket.on('total_data_response', function(data) {
    console.log(data);
    data = [];
    var obj = {
      id : 1,
      name : 'haha',
      status : 0
    }
    var obj2 = {
      id : 2,
      name : 'haha',
      status : 0
    }
    data.push(obj);
    data.push(obj2);
    var html = joinData(data);
    $('#table_body').html(html);
  });

  requestData();
  function requestData() {
    socket.emit('total_data_request', {}); 
  }
  function joinData(arr) {
    var res = '';
    for (var i = 0; i < arr.length; i++) {
      res +=
        '<tr>' +
          '<td>' + arr[i].id + '</td>' +
          '<td>' + arr[i].name + '</td>' +
          '<td>' + arr[i].status + '</td>' +
          '<td>' + '<a href="/single?id=' + arr[i].id + '" class="btn btn-success btn-sm">查看</a></td>' +
        '</tr>';
    }
    return res;
  }
});
