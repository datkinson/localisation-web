application.controller('commentController', function($scope) {
	$scope.general.subheading = 'Comments';
	$scope.message = 'Contact us with lots of cool information';
	$scope.comment = {};
	$scope.submitComment = function() {
		$scope.hasSubmitted = true;
		// submit comment to server
		socket.emit('submitComment', $scope.comment);
		$scope.comment = {};
	};
	$scope.submitAnother = function() {
		$scope.hasSubmitted = false;
	};
});