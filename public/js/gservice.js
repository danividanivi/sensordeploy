// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
angular.module('gservice', [])
    .factory('gservice', function($rootScope, $http){

        // Initialize Variables
        // -------------------------------------------------------------
        // Service our factory will return
        var googleMapService = {};

        // Array of locations obtained from API calls
        var locations = [];

        // Variables we'll use to help us pan to the right spot
        var lastMarker;
        var lastCircle;
        var currentSelectedMarker;

        // Selected Location (initialize to center of America)
        var selectedLat = 42.891880;
        var selectedLong = -8.420556;

        // Handling Clicks and location selection
        googleMapService.clickLat  = 0;
        googleMapService.clickLong = 0;

        // Functions
        // --------------------------------------------------------------
        // Refresh the Map with new data. Takes three parameters (lat, long, and filtering results)
        googleMapService.refresh = function(latitude, longitude, filteredResults){

            // Clears the holding array of locations
            locations = [];

            // Set the selected lat and long equal to the ones provided on the refresh() call
            selectedLat = latitude;
            selectedLong = longitude;

            // If filtered results are provided in the refresh() call...
            if (filteredResults){

                // Then convert the filtered results into map points.
                locations = convertToMapPoints(filteredResults);

                // Then, initialize the map -- noting that a filter was used (to mark icons yellow)
                initialize(latitude, longitude, true);
            }

            // If no filter is provided in the refresh() call...
            else {

                // Perform an AJAX call to get all of the records in the db.
                $http.get('/users').success(function(response){

                    // Then convert the results into map points
                    locations = convertToMapPoints(response);

                    // Then initialize the map -- noting that no filter was used.
                    initialize(latitude, longitude, false);
                }).error(function(){});
            }
        };

        // Private Inner Functions
        // --------------------------------------------------------------
        // Convert a JSON of users into map points
        var convertToMapPoints = function(response){

            // Clear the locations holder
            var locations = [];

            // Loop through all of the JSON entries provided in the response
            for(var i= 0; i < response.length; i++) {
                var user = response[i];

                // Create popup windows for each record
                var  contentString =
                    '<p><b>Identifier</b>: ' + user.identifier +
                    '<br><b>Range</b>: ' + user.range +
                    '<br><b>Type</b>: ' + user.type +
                    '<br><b>Comments</b>: ' + user.comments +
                    '</p>';

                // Converts each of the JSON records into Google Maps Location format (Note [Lat, Lng] format).
                locations.push({
                    latlon: new google.maps.LatLng(user.location[1], user.location[0]),
                    message: new google.maps.InfoWindow({
                        content: contentString,
                        maxWidth: 320
                    }),
                    identifier: user.identifier,
                    type: user.type,
                    range: user.range,
                    comments: user.comments
                });
            }
            // location is now an array populated with records in Google Maps format
            return locations;
        };

        // Initializes the map
        var initialize = function(latitude, longitude, filter) {

            // Uses the selected lat, long as starting point
            var myLatLng = {lat: selectedLat, lng: selectedLong};

            // If map has not been created...
            if (!map){

                // Create a new map and place in the index.html page
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 18,
                    center: myLatLng
                });
            }

            // If a filter was used set the icons yellow, otherwise blue
            if(filter){
                icon = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
            }
            else{
                icon = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
            }

            // Loop through each location in the array and place a marker
            locations.forEach(function(n, i){

                var color;

                switch(n.type) {
                    case "Leaf":
                        color = '#FF0000';
                        icon = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
                        break;
                    case "Gateway":
                        color = '#0000ff'
                        icon = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
                        break;
                    case "CurrentConnected":
                        color = '#ffff00'
                        icon = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
                    default:
                        color = '#ffff00';
                }

                var marker = new google.maps.Marker({
                    position: n.latlon,
                    map: map,
                    title: "Big Map",
                    draggable: true,
                    color: color,
                    icon: icon,
                });









                /*var circle = new google.maps.Circle({
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    draggable:true,
                    fillColor: color,
                    fillOpacity: 0.35,
                    map: map,
                    center: marker.position,
                    radius: n.range
                });

                marker.bindTo("position", circle, "center");*/


                // For each marker created, add a listener that checks for clicks
                google.maps.event.addListener(marker, 'click', function(e){

                    // When clicked, open the selected marker's message
                    currentSelectedMarker = n;
                    n.message.open(map, marker);
                        var circle = new google.maps.Circle({
                            strokeColor: '#FF0000',
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            draggable:true,
                            fillColor: color,
                            fillOpacity: 0.35,
                            map: map,
                            center: marker.position,
                            radius: n.range
                        });


                        marker.bindTo("position", circle, "center");
                }











                );






            });







            // Set initial location as a bouncing red marker
            var initialLocation = new google.maps.LatLng(latitude, longitude);
            var marker = new google.maps.Marker({
                position: initialLocation,
                animation: google.maps.Animation.BOUNCE,
                draggable: true,
                map: map,
                icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            });
            var circle = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                draggable: true,
                fillColor: '#FF0000',
                fillOpacity: 0.35,
                map: map,
                center: marker.position,
                radius: 25
            });
            marker.bindTo("position", circle, "center");
            lastCircle = circle;
            lastMarker = marker;

            // Function for moving to a selected location
            map.panTo(new google.maps.LatLng(latitude, longitude));

            // Clicking on the Map moves the bouncing red marker
            google.maps.event.addListener(map, 'click', function(e){
                var marker = new google.maps.Marker({
                    position: e.latLng,
                    draggable: true,
                    animation: google.maps.Animation.BOUNCE,
                    map: map,
                    icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                });

                var circle = new google.maps.Circle({
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    draggable: true,
                    fillColor: '#FF0000',
                    fillOpacity: 0.35,
                    map: map,
                    center: marker.position,
                    radius: 25
                });

                marker.bindTo("position", circle, "center");

                // When a new spot is selected, delete the old red bouncing marker
                if(lastMarker){
                    lastMarker.setMap(null);
                    lastCircle.setMap(null);
                }

                // Create a new red bouncing marker and move to it
                lastMarker = marker;
                lastCircle = circle;
                map.panTo(marker.position);

                // Update Broadcasted Variable (lets the panels know to change their lat, long values)
                googleMapService.clickLat = marker.getPosition().lat();
                googleMapService.clickLong = marker.getPosition().lng();
                $rootScope.$broadcast("clicked");


            }





            );

            google.maps.event.addListener(lastMarker, "dragend", function(e) {
                //alert('marker dragged');
                lastMarker.getPosition();

                // Update Broadcasted Variable (lets the panels know to change their lat, long values)
                googleMapService.clickLat = lastMarker.getPosition().lat();
                googleMapService.clickLong = lastMarker.getPosition().lng();
                $rootScope.$broadcast("clicked");
            });

            google.maps.event.addListener(lastCircle, "dragend", function(e) {
                // alert('circle dragged');
                lastMarker.getPosition();

                // Update Broadcasted Variable (lets the panels know to change their lat, long values)
                googleMapService.clickLat = lastMarker.getPosition().lat();
                googleMapService.clickLong = lastMarker.getPosition().lng();
                $rootScope.$broadcast("clicked");
            });
        };





        // Refresh the page upon window load. Use the initial latitude and longitude
        google.maps.event.addDomListener(window, 'load',
            googleMapService.refresh(selectedLat, selectedLong));

        return googleMapService;
    });

