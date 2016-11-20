'use strict';
angular.module('gwf4').
service('PositionSrvc', function($q, $rootScope) {

	var PositionSrvc = this;
	
	PositionSrvc.MAX_TRY = 0;
	PositionSrvc.MAX_TRIES = 5;
	PositionSrvc.MAX_TRY_TIMEOUT = 15;

	PositionSrvc.PROBED = false;
	PositionSrvc.HIGH_PRECISION = true;

	PositionSrvc.OPTIONS = {
			enableHighAccuracy: PositionSrvc.HIGH_PRECISION,
			maximumAge: 60000,
			timeout: 57000
	};

	PositionSrvc.UNKNOWN = 1;
	PositionSrvc.KNOWN = 2;
	PositionSrvc.PATCHED = 3;
	
	PositionSrvc.INTERVAL = null;
	
	PositionSrvc.CURRENT = {
			latlng: null,   // google maps
			position: { coords: { latitude: null, longitude: null} }, // browser
			patch: { lat: null, lng: null },
			real: { timestamp: 0, lat: null, lng: null },
			state: {
				val: PositionSrvc.UNKNOWN,
				text: 'unknown',
			},
			lat: null,
			lng: null
	};
	
	PositionSrvc.age = function() {
		console.log('PositionSrvc.age()');
		var c = PositionSrvc.CURRENT;
		return c.real.timestamp <= 0? 1999999999 : new Date().getTime() - c.real.timestamp;
	};
	
	PositionSrvc.togglePrecision = function() {
		console.log('PositionSrvc.togglePrecision()');
		PositionSrvc.OPTIONS.enableHighAccuracy = !PositionSrvc.OPTIONS.enableHighAccuracy;
	};
	
	///////////
	// Probe //
	///////////
	PositionSrvc.probe = function() {
		console.log('PositionSrvc.probe()');
		var defer = $q.defer();
		if (PositionSrvc.PROBED) {
			defer.resolve();
		}
		else if (!navigator.geolocation) {
			defer.reject('Browser has no geolocation');
		}
		else {
			PositionSrvc.sendProbe(defer);
		}
		return defer.promise;
	};
	
	PositionSrvc.sendProbe = function(defer) {
		navigator.geolocation.getCurrentPosition(
				PositionSrvc.probeSuccess.bind(PositionSrvc, defer), 
				PositionSrvc.probeFailure.bind(PositionSrvc, defer),
				PositionSrvc.OPTIONS);
	};
	
	PositionSrvc.probeSuccess = function(defer, position) {
		console.log('PositionSrvc.probeSuccess()', defer, position);
		PositionSrvc.PROBED = true;
		var p = position.coords;
		PositionSrvc.setReal(p.latitude, p.longitude);
		PositionSrvc.start();
		defer.resolve(PositionSrvc.CURRENT);
	};

	PositionSrvc.probeFailure = function(defer, error) {
		console.log('PositionSrvc.probeFailure()', defer, error);
		PositionSrvc.MAX_TRY++;
		if (PositionSrvc.MAX_TRY >= PositionSrvc.MAX_TRIES) {
			defer.reject(error);
		}
		else {
			PositionSrvc.togglePrecision();
			setTimeout(PositionSrvc.sendProbe.bind(this, defer), PositionSrvc.MAX_TRY_TIMEOUT);
		}
	};
	
	///////////
	// Watch //
	///////////
	PositionSrvc.start = function() {
		console.log('PositionSrvc.start()');
		if (!PositionSrvc.INTERVAL) {
			PositionSrvc.INTERVAL = navigator.geolocation.watchPosition(PositionSrvc.watchSuccess, PositionSrvc.watchFailure, PositionSrvc.OPTIONS);	
		}
	};
	
	PositionSrvc.stop = function() {
		console.log('PositionSrvc.stop()');
		PositionSrvc.INTERVAL = null;
	};
	
	PositionSrvc.watchSuccess = function(position) {
		console.log('PositionSrvc.watchSuccess()', position);
		var p = position.coords;
		PositionSrvc.setReal(p.latitude, p.longitude);
	};
	
	PositionSrvc.watchFailure = function(error) {
		console.log('PositionSrvc.watchFailure()', error);
		PositionSrvc.PROBED = false;
		PositionSrvc.probe();
	};
	
	//////////////
	// Patching //
	//////////////
	PositionSrvc.patching = function() {
		return PositionSrvc.CURRENT.state.val === PositionSrvc.PATCHED;
	};
	
	PositionSrvc.startPatching = function(lat, lng) {
		console.log('PositionSrvc.startPatching()', lat, lng);
		var c = PositionSrvc.CURRENT;
		c.patch.lat = lat;
		c.patch.lng = lng;
		PositionSrvc.setCurrent(lat, lng, PositionSrvc.PATCHED);
	};
	
	PositionSrvc.stopPatching = function() {
		console.log('PositionSrvc.stopPatching()');
		var c = PositionSrvc.CURRENT;
		c.patch.lat = null;
		c.patch.lng = null;
		PositionSrvc.setState(c.real.lat === null ? PositionSrvc.UNKNOWN : PositionSrvc.KNOWN);
		if (c.real.lat) {
			PositionSrvc.setCurrent(c.real.lat, c.real.lng, PositionSrvc.KNOWN);
		}
		else {
			PositionSrvc.probe();
		}
	};
	
	/////////
	// Set //
	/////////
	PositionSrvc.setReal = function(lat, lng) {
		console.log('PositionSrvc.setReal()', lat, lng);
		var c = PositionSrvc.CURRENT;
		c.real.timestamp = new Date().getTime();
		c.real.lat = lat;
		c.real.lng = lng;
		PositionSrvc.setCurrent(lat, lng, PositionSrvc.CURRENT.state.val === PositionSrvc.UNKNOWN ? PositionSrvc.KNOWN : PositionSrvc.CURRENT.state.val);
	};
	
	PositionSrvc.setCurrent = function(lat, lng, state) {
		console.log('PositionSrvc.setCurrent()', lat, lng, state);
		var c = PositionSrvc.CURRENT;
		PositionSrvc.setState(state);
		switch (c.state.val) {
		case PositionSrvc.PATCHED:
			PositionSrvc.setCoordinates(c.patch.lat, c.patch.lng);
			break;
		case PositionSrvc.KNOWN:
			PositionSrvc.setCoordinates(lat, lng);
			break;
		case PositionSrvc.UNKNOWN:
			break;
		default:
			console.error('Invalid state: '+state);
		}
	};
	
	PositionSrvc.setCoordinates = function(lat, lng) {
		console.log('PositionSrvc.setCoordinates()', lat, lng);
		var c = PositionSrvc.CURRENT;
		c.lat = lat;
		c.lng = lng;
		c.latlng = new google.maps.LatLng({lat:lat, lng:lng});
		c.position = {coords:{latitude: lat, longitude:lng}};
		$rootScope.$broadcast('gwf-position-changed', PositionSrvc.CURRENT);
	};
	
	PositionSrvc.setState = function(state) {
		console.log('PositionSrvc.setState()', state);
		var c = PositionSrvc.CURRENT;
		c.state.val = state;
		switch (state) {
		case PositionSrvc.UNKNOWN: c.state.text = 'unknown'; break;
		case PositionSrvc.KNOWN: c.state.text = 'known'; break;
		case PositionSrvc.PATCHED: c.state.text = 'patched'; break;
		default:
			c.state.text = 'errorneous'; break;
			console.error('Invalid state: '+state);
		}
	};
});


