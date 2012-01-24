var geocoder;
var map;
var poly;
var latitude = 40.729448;
var longitude = -73.993671;
var latlong;
var bounds;

function initialize() { 
	// establish map defaults
	geocoder = new google.maps.Geocoder();
	var latlong = new google.maps.LatLng(latitude,longitude);
	var myOptions = {
		center: latlong,
		zoom: 18,
		mapTypeId: google.maps.MapTypeId.SATELLITE,
		mapTypeControl: false,
		streetViewControl: false,
		scrollwheel: false
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
}
function codeAddress() {
	// given an address, go to that location and draw a rectangle around
	if (null != poly) poly.setMap(); // reset the polygon if function is called again 
	var address = document.getElementById("address").value;
	geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			map.setCenter(results[0].geometry.location);
			latlong = results[0].geometry.location;
			var marker = new google.maps.Marker({
				map: map,
				position: results[0].geometry.location
			});
			var box = getBoundingBox(latlong,.01);
			bounds = [
				new google.maps.LatLng(box[0],box[2]),
				new google.maps.LatLng(box[0],box[3]),
				new google.maps.LatLng(box[1],box[3]),
				new google.maps.LatLng(box[1],box[2])
			]; // creates the NW NE SE SW corners of the box around the given location
			var polyOptions = {
				paths: bounds,
				map: map,
				strokeColor: "#FF0000",
				strokeOpacity: 0.8,
				strokeWeight: 2, 
				fillColor: "#FF0000",
				fillOpacity: 0.35,
				editable: true,
				draggable: false
			}; // polygon options
			poly = new google.maps.Polygon(polyOptions);
		} else {
			alert("Geocode was not successful for the following reason: " + status);
		}
	});	
}

function getPerim() {
	// return the perimeter of the polygon if created
	if (null != poly) {
		var perim = poly.getPaths();
		return perim;
	}
}

function getArea() {
	// return the area of the polygon if created
	if (null != poly) {
		var area = google.maps.geometry.spherical.computeArea(poly.getPath()); 
		return area;
	}
}

function printArea() {
	// print the area of the polygon on the page if created
	if (null != poly) {
		document.getElementById('areaOutput').innerHTML = parseInt(getArea()) + " Square Meters";
	}
}

function getBoundingBox(latlon,distance_in_miles) {

	radius = 3963.1; // of earth in miles

	// bearings 
	due_north = 0;
	due_south = 180;
	due_east = 90;
	due_west = 270;

	// parse the google maps latlon JSON object
	ltlg = latlon.lat().toFixed(6) + ',' + latlong.lng().toFixed(6);
	latArray = ltlg.split(",");
	lat_degrees = latArray[0];
	lon_degrees = latArray[1];

	// convert latitude and longitude into radians 
	lat_r = deg2rad(lat_degrees);
	lon_r = deg2rad(lon_degrees);

	// find the northmost, southmost, eastmost and westmost corners distance_in_miles away
	// http://www.movable-type.co.uk/scripts/latlong.html
	with (Math) {
		northmost  = asin(sin(lat_r) * cos(distance_in_miles/radius) + cos(lat_r) * sin (distance_in_miles/radius) * cos(due_north));
		southmost  = asin(sin(lat_r) * cos(distance_in_miles/radius) + cos(lat_r) * sin (distance_in_miles/radius) * cos(due_south));

		eastmost = lon_r + atan2(sin(due_east)*sin(distance_in_miles/radius)*cos(lat_r),cos(distance_in_miles/radius)-sin(lat_r)*sin(lat_r));
		westmost = lon_r + atan2(sin(due_west)*sin(distance_in_miles/radius)*cos(lat_r),cos(distance_in_miles/radius)-sin(lat_r)*sin(lat_r));
	}

	northmost = rad2deg(northmost);
	southmost = rad2deg(southmost);
	eastmost = rad2deg(eastmost);
	westmost = rad2deg(westmost);

	// sort the lat and long       
	if (northmost > southmost) { 
		lat1 = southmost;
		lat2 = northmost;

	} else {
		lat1 = northmost;
		lat2 = southmost;
	}


	if (eastmost > westmost) { 
		lon1 = westmost;
		lon2 = eastmost;

	} else {
		lon1 = eastmost;
		lon2 = westmost;
	}

	return [lat1,lat2,lon1,lon2];
}

function rad2deg (radian) {
	// Converts the radian number to the equivalent number in degrees  
	return radian / (Math.PI / 180);
}

function deg2rad (degree) {
	// Converts the number in degrees to the radian equivalent  
	return  degree * (Math.PI / 180);
}
