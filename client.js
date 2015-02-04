// Initialise the socket
var socket = io.connect(BROADCAST_IP + ':' + BROADCAST_PORT);

// When connected
socket.on('connect', function () { });

function parseTime (time) {
  // Get times
  var format = function (str) {
    str = str.toString();
    return str.length > 1 ? str : '0' + str;
  };

  // Parse the times
  var hours = format(Math.floor(time / 3600));
  var minutes = format(Math.floor((time % 3600) / 60));
  var seconds = format((time % 3600) % 60);

  // Final results
  return hours + ':' + minutes + ':' + seconds
}
