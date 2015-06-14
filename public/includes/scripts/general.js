socket.on('info', function (data) {
    console.log(data);
});

socket.on('debug', function(data) {
    console.debug(data);
});