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
		PositionSrvc.startPatching(latlng.lat(), latlng.lng());
		$scope.data.fix = true;
		$scope.data.fixLat = latlng.lat();
		$scope.data.fixLng = latlng.lng();
	};
	
	$scope.locationNotPicked = function(error) {
		console.log('LocationBarCtrl.locationNotPicked()', error);
	};
	
	$scope.toggleFixture = function() {
		console.log('LocationBarCtrl.toggleFixture()');
		if ($scope.data.fix) {
			if ($scope.data.fixLat) {
				PositionSrvc.startPatching($scope.data.fixLat, $scope.data.fixLng);
			}
			else {
				$scope.data.fix = false;
			}
		}
		else {
			PositionSrvc.stopPatching();
		}
	};
	
	$scope.$on('gwf-position-changed', function($event, position) {
		console.log('LocationBarCtrl.$on-gwf-position-changed()', position);
		$scope.data.position = position;
		setTimeout($scope.$apply.bind($scope), 1);
	});

	///////////
	// Probe //
	///////////
	$scope.onProbe = function() {
		console.log('LocationBarCtrl.onDetect()');
		PositionSrvc.probe().then($scope.detected(), $scope.probeFailed);
	};
	
	$scope.detected = function(position) {
		console.log('LocationBarCtrl.detected()', position);
		setTimeout($scope.$apply.bind($scope), 1);
	};
			
	$scope.probeFailed = function(error) {
		console.log('LocationBarCtrl.probeFailed()', error);
		ErrorSrvc.showError(error.message, "Position Error");
	};

});
