application.controller('adminController', function($scope, $location, general, user) {
	$scope.general.subheading = 'Administration';
	$scope.user = user;
	$scope.message = 'This is the admin page';
	$scope.comments = [];
	
	// init function for controller
	// this runs when view is loaded
	$scope.init = function() {
	};
	// change modes
	$scope.changeMode = function (mode) {
		if(mode === 'admin') {
			socket.emit('requestMode', mode);
		}
		if(mode === 'user') {
			socket.emit('requestMode', mode);
		}
	};
	socket.on('changeMode', function(data) {
		$scope.user.mode = data;
		if(data === 'admin') { $scope.user.isAdmin = true; }
		if(data === 'user') { $scope.user.isAdmin = false; }
	});
	
	
	// redirects
	$scope.requestRedirect = function(location) {
		if($scope.user.isAdmin) {
			socket.emit('requestRedirect', location);
		}
	};
	
	// activiate init function
	$scope.init();
});