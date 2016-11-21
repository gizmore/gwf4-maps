'use strict';
angular.module('gwf4').
service('LocationPicker', function($q, $mdDialog, MapUtil) {
	
	var LocationPicker = this;
	
	LocationPicker.open = function(text, initPosition) {

		var defer = $q.defer();
		
		function DialogController($scope, $mdDialog, text, initPosition) {
			$scope.data = {
				marker: null,
				initPosition: initPosition,
				text: text,
				map: null,
			};
			$scope.pickPosition = function() {
				$mdDialog.hide();
				if ($scope.data.marker) {
					defer.resolve($scope.data.marker.getPosition());
				}
				else {
					defer.reject();
				}
			};
			$scope.closeDialog = function() {
				$mdDialog.hide();
				defer.reject();
			};
			$scope.clicked = function(event) {
				if (!$scope.data.marker) {
					$scope.data.marker = new google.maps.Marker({
						position: event.latLng,
						map: $scope.data.map,
						title: 'Your position',
						label: 'Your Position',
						draggable: true,
					});
					$scope.data.map.setCenter(event.latLng);
				}
				$scope.data.marker.setPosition(event.latLng);
			};
			
			setTimeout(function() {
				if (!$scope.data.map) {
					$scope.data.map = MapUtil.map('gwf-dialog-map');
					$scope.data.map.addListener('click', $scope.clicked);
				}
			}, 1);
		}
		
		$mdDialog.show({
			templateUrl: GWF_WEB_ROOT+'module/Maps/js/tpl/gwf-location-picker.html',
			locals: {
				initPosition: initPosition,
				text: text,
			},
			controller: DialogController,
			onComplete: function() {
			}
		});
		
		return defer.promise;
	};

});
