// Creates the addCtrl Module and Controller. Note that it depends on the 'geolocation' and 'gservice' modules and controllers.
var editCtrl = angular.module('editCtrl', ['geolocation', 'gservice']);
editCtrl.controller('editCtrl', function($scope, $http, $rootScope, geolocation, gservice){

    // Initializes Variables
    // ----------------------------------------------------------------------------
    $scope.formData = {};
    var coords = {};
    var lat = 0;
    var long = 0;

    // Set initial coordinates to SCQ
    $scope.formData.latitude = 42.891880;
    $scope.formData.longitude = -8.420556;

    //I don't want to work with real location yet

/*    geolocation.getLocation().then(function(data){

        // Set the latitude and longitude equal to the HTML5 coordinates
        coords = {lat:data.coords.latitude, long:data.coords.longitude};

        // Display coordinates in location textboxes rounded to three decimal points
        $scope.formData.longitude = parseFloat(coords.long).toFixed(6);
        $scope.formData.latitude = parseFloat(coords.lat).toFixed(6);

        // Display message confirming that the coordinates verified.
        $scope.formData.htmlverified = "Yes (Thanks for giving real data!)";

        gservice.refresh($scope.formData.latitude, $scope.formData.longitude);

    });*/

    // Functions
    // ----------------------------------------------------------------------------
    // Get coordinates based on mouse click. When a click event is detected....
    $rootScope.$on("clicked", function(){

        // Run the gservice functions associated with identifying coordinates
        $scope.$apply(function(){
            $scope.formData.latitude = parseFloat(gservice.clickLat).toFixed(6);
            $scope.formData.longitude = parseFloat(gservice.clickLong).toFixed(6);
            $scope.formData.htmlverified = "No (Check later that place)";
        });
    });

    // Creates a new user based on the form fields
    $scope.createUser = function() {

        // Grabs all of the text box fields
        var userData = {
            identifier: $scope.formData.identifier,
            type: $scope.formData.type,
            range: $scope.formData.range,
            comments: $scope.formData.comments,
            location: [$scope.formData.longitude, $scope.formData.latitude],
            htmlverified: $scope.formData.htmlverified
        };

        // Saves the user data to the db
        $http.put('/users', userData)
            .success(function (data) {

                // Once complete, clear the form (except location)
                $scope.formData.identifier = "";
                $scope.formData.type = "";
                $scope.formData.range = "";
                $scope.formData.comments = "";

                // Refresh the map with new data
                gservice.refresh($scope.formData.latitude, $scope.formData.longitude);
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };
});