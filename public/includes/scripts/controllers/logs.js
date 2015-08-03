application.controller('logsController', function($scope, $location, general, user) {
	$scope.general.subheading = 'Logs';
	$scope.user = user;
	$scope.message = 'This is the logs page';
	$scope.logs = [];
	
	// init function for controller
	// this runs when view is loaded
	$scope.init = function() {
		// get all comments
		socket.emit('getLogs', 'all');
	};
	
	// recieve comments from server
	socket.on('allLogs', function(data) {
		$scope.logs = data.slice(0,15);
		$scope.$apply(function() {
			$scope.logs = data.slice(0,15);
		});
	});

	// activiate init function
	$scope.init();
});
