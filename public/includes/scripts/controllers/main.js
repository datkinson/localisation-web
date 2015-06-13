application.controller('mainController', function($scope, $location, general) {
	$scope.general = general;
	
	// on recieving location message redirect client to the recieved route
	socket.on('location', function (data) {
		$location.path( "/" + data );
	});
});