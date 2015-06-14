application.controller('mainController', function($scope, $rootScope, $location, general, user) {
	$scope.general = general;
	$scope.user = user;
	
	// on recieving location message redirect client to the recieved route
	socket.on('location', function (data) {
		if(!$scope.user.isAdmin) {
			$rootScope.$apply(function() {
				$location.path("/" + data);
			});
		}
	});
});