'use strict';

// Map constants
var CONSTANTS = {
	MAP_CENTER_LAT: 47.606,
	MAP_CENTER_LNG: -122.332,
	MAP_ZOOM: 15
};

// Foursquare API access
var clientID = 'IQBDWUCGPKTF1VZGHFARFOQMEGZR5HBRSEJY1ZBWLYG0BU2X';
var clientSecret = 'PZ0I1IBSF45JK05SCMQILMQSHM3WHZSWRTC2MZ4WNS2WJRA2';

let startingLocations = [
	{
		name: 'Frye Art Museum',
		lat: 47.6069,
        lng: -122.3241
	},
	{
		name: 'Purple Cafe & Wine Bar',
		lat: 47.6079577,
		lng: -122.335092
	},
	{
		name: 'Zig Zag Cafe',
		lat: 47.6084991,
		lng: -122.3416807
	},
	{
		name: 'Fonté Coffee Roaster Café',
		lat: 47.6072047,
		lng: -122.3389968
	},
	{
		name: 'Cafe Campagne',
		lat:  47.6097262,
		lng: -122.3415471
	}
];

//Initialization of location data and API loading of location specifics
const Location = function(data) {
    var self = this;
    this.visible = ko.observable(true);
	this.name = data.name;
	this.lat = data.lat;
    this.lng = data.lng;
    this.URL = "";
	
	this.street = "";
	this.city = "";
	this.phone = "";

	const fsqrUrl = `https://api.foursquare.com/v2/venues/search?ll=${this.lat},${this.lng}&client_id=${clientID}&client_secret=${clientSecret}&v=20160118&query=${this.name}`;

	$.getJSON(fsqrUrl).done(function(data) {
		let results = data.response.venues;
		
        return results.map(result => {
            self.street = result.location.formattedAddress[0];
     	    self.city = result.location.formattedAddress[1];
		});
		
	}).fail(function() {
		alert("Error with  Foursquare API call. Try to load Foursquare data again.");
	});

	this.infoString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" +
         "</div></div>";

	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(data.lat, data.lng),
			map: map,
			title: data.name
    });
    
    this.infoWindow = new google.maps.InfoWindow({
        content: self.infoString
    });

	this.visibleMarker = ko.computed(function() {
		if (this.visible()) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);

	this.bounce = function() {
		google.maps.event.trigger(self.marker, 'click');
	};

	this.marker.addListener('click', function(){
		self.infoString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" +
        "</div></div>";

        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        self.infoWindow.setContent(self.infoString);
        self.infoWindow.open(map, this);
        
      	setTimeout(function() {
      		self.marker.setAnimation(null);
     	}, 1800);
	});
};
let map;

function AppViewModel() {
	map = new google.maps.Map(document.getElementById('mapArea'), {
        zoom: CONSTANTS.MAP_ZOOM,
        center: {lat: CONSTANTS.MAP_CENTER_LAT, lng: CONSTANTS.MAP_CENTER_LNG}
	});
	
	var self = this;
	this.term = ko.observable("");
	this.loadedLocations = ko.observableArray([]);

	startingLocations.forEach(function(spot){
		self.loadedLocations.push(new Location(spot));
	});
    // Filter by search term and display appropriate location in list, leaving marker too
	this.filteredList = ko.computed(function() {
		let filtered = self.term().toLowerCase();
		if (!filtered) {
			self.loadedLocations().forEach(function(spot){
				spot.visible(true);
            });
			return self.loadedLocations();

		} else {
			return ko.utils.arrayFilter(self.loadedLocations(), function(spot) {
				let string = spot.name.toLowerCase();
				let result = (string.search(filtered) >= 0);
				spot.visible(result);
				return result;
			});
		}
	}, self);

	self.mapComponent = document.getElementById('mapArea');
	self.mapComponent.style.height = window.innerHeight - 40;
}


function startApp() {
	ko.applyBindings(new AppViewModel());
}