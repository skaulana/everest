// the "database" :)
// todo: lobby NHIS for an API to get this dynamically...
var healthLoc = [
    ["Adabraka Polyclinic", 5.562248893683982, -0.20480663719560466, "0302-688554", "Clinic"],
    ["Castle Clinic", 5.546992, -0.183419, "0244-611528/0302-666284", "Health Centre"],
    ["Civil Service Clinic", 5.549312, -0.196457, "0244-271816/0302-662808", "Health Centre"],
    ["Ridge Regional Hospital", 5.562663, -0.198978, "020-8158550/0302-228315/0302-228382", "Secondary Hospital"],
    ["Iran Clinic", 5.5686089,-0.2124885, "020-8180269/0302-222402", "Clinic"],
    ["Aboraa Hospital", 5.570878, -0.208515, "0244-371194/020-8157820", "Primary Hospital"],
    ["Accra Chemist LTD", 5.560520, -0.211285, "0277-401023/0302-227202", "Pharmacy"],
    ["Castle Drive Clinic", 5.562879, -0.201225, "020-8129192/0302-662700", "Clinic"],
    ["Health Watch Pharmacy", 5.569671, -0.206439, "020-8134169/0302-245500", "Pharmacy"],
    ["La Road Dental Clinic", 5.552642, -0.177469, "0244-280180/0302-760391", "Dental Clinic"],
    ["Longview Pharmaceutical Company LTD", 5.564007, -0.211186, "0244-234838/0264-234838/0302-225257", "Pharmacy"],
    ["Odorna Clinic", 5.559435, -0.212883, "0244-769195", "Clinic"],
    ["Primrose Pharmacy", 5.563520, -0.186242, "0302781744/0244575568", "Pharmacy"],
    ["Rabito Clinic", 5.565021, -0.179354, "0244-312699/0302-774526", "Clinic"],
    ["Ringway Chemists LTD", 5.568696, -0.186863, "020-7250869/0302-220452", "Pharmacy"],
    ["Tudu Pharmacy", 5.549622150297501,-0.2019914226094175, "020-8179666/0275-065280/0302-662526", "Pharmacy"],
    ["Universal Chemist LTD", 5.557499543287522,-0.20904128778467615, "0240-716834/0302-234198", "Pharmacy"],
    ["Bob Freeman Clinic", 5.565624, -0.211688, "020-2018127/0302-682832", "Clinic"],
    ["Graphic Communications Group LTD Clinic", 5.555067, -0.211791, "020-8138033/0302-234756/0244-679664", "Clinic"],
    ["VRA Hospital", 5.553010, -0.186020, "0302-776427/0244-712311", "Primary Hospital"],
    ["Angola Road Chemist", 5.557445, -0.187432, "020-8185704/0302-223768", "Pharmacy"],
    ["Vicdoris Pharmacy Limited", 5.569971, -0.212139, "0244-233418/0302-235145", "Pharmacy"],
    ["Wellness Laboratory Limited", 5.572214, -0.188495, "0244-275649/020-4275649/0302-767370-72", "Laboratory"]
];
  
// helper to show/hide different 'page' divs
function toggle_to(id) {
    $(".toggleable").addClass("hidden");
    $("#"+id).fadeIn(200).removeClass("hidden");
    
    if (id =="page-map") initialize();
}

// render the Google Map & locations for the clinics page
function initialize() {
    var mapOptions = {
        center: { lat: 5.562, lng: -0.198},
        zoom: 15
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    if (navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(function(position) {
            initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
            map.setCenter(initialLocation);
        }, function() {
            console.log('failed to geolocate the user')
        });
    }

    // sort clinics by distance to user
    var userLat = map.getCenter().lat();
    var userLng = map.getCenter().lng();
    for(var i = 0; i < healthLoc.length; i++) {
        var dist = getDistanceFromLatLonInKm(userLat, userLng, healthLoc[i][1], healthLoc[i][2]);
        healthLoc[i]["dist"] = dist;
    }
    healthLoc.sort(function(a, b) { return a["dist"] - b["dist"]; });
    
    // add each clinic marker to the map
    for(var i = 0; i < healthLoc.length; i++) {
        var myCenter = new google.maps.Marker({
            position: new google.maps.LatLng(healthLoc[i][1],healthLoc[i][2],healthLoc[i][3],healthLoc[i][4]),
            map: map
            //title: healthLoc[i][0]
        });

        var mapClickDelegate = (function (marker) {
            return function() {
                map.panTo(marker.getPosition());
            };
        })(myCenter);

        google.maps.event.addListener(myCenter, 'click', mapClickDelegate);
    }
    
    // generate HTML for page
    render_map_locations();    
}
//google.maps.event.addDomListener(window, 'load', initialize);

// basic template for map locations
function render_map_locations() {
    $("#map-locations").append(
        "<h3>" + healthLoc.length + " " + (healthLoc.length == 1 ? "facility" : "facilities") +
        " in Osu Klottey</h3>"
    );
    
    for(var i = 0; i < healthLoc.length; i++) {
      $("#map-locations").append(
        "<div class='map-item'>" +
        "<em class='pull-right'>" + (+healthLoc[i]["dist"].toFixed(2)) + " km</em>" +
        "<span class='glyphicon glyphicon-map-marker'></span> " +
        healthLoc[i][0] +
        "</div>"
      );
    }
}
