application.controller('homeController', function($scope, general) {
	$scope.general = general;
	$scope.general.title = 'Home';
	$scope.general.subheading = 'Home Page';
	$scope.message = 'Welcome to the home page';
})