'use strict';
angular.module('gwf4').
controller('LocationBarCtrl', function($scope, PositionSrvc, LocationPicker, ErrorSrvc) {

	$scope.data = {
			position: PositionSrvc.CURRENT,
			fix: false,
			fixLat: null,
			fixLng: null,
	};
	
	//////////
	// Pick //
	//////////
	$scope.onPick = function() {
		console.log('LocationBarCtrl.onPick()');
		LocationPicker.open().then($scope.locationPicked, $scope.locationNotPicked);
	};
	
	$scope.locationPicked = function(latlng) {
		console.log('LocationBarCtrl.onPick()');
		PositionSrvc.setReal(latlng.lat(), latlng.lng());
	};
	
	$scope.locationNotPicked = function(error) {
		console.log('LocationBarCtrl.locationNotPicked()', error);
	};
	
	$scope.fixture = function() {
		console.log('LocationBarCtrl.fixture()');
	};

	///////////
	// Probe //
	///////////
	$scope.onProbe = function() {
		console.log('LocationBarCtrl.onDetect()');
		PositionSrvc.probe().then($scope.detected(), $scope.probeFailed);
	};
	
	$scope.detected = function(position) {
		console.log('LocationBarCtrl.detected()'. position);
	};
			
	$scope.probeFailed = function(error) {
		console.log('LocationBarCtrl.probeFailed()', error);
		ErrorSrvc.showError(error.message, "Position Error");
	};

});
