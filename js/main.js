// the "database" :)
// todo: lobby NHIS for an API to get this dynamically...

// clinics: name, lat, long, phone(s), type
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
// drugs: name, dosage, GH¢ price per dose
var healthMed = [
    ["Acetazolamide Injection", "500 mg Ampoule", 22],
    ["Acetazolamide", "250 mg Tablet", 0.1],
    ["Acetylcysteine Injection", "1 mL", 7.8],
    ["Acetylsalicylic Acid Tablet", "300 mg", 0.03],
    ["Acetylsalicylic Acid Dispersible Tablet", "75 mg", 0.03],
    ["Activated Charcoal Powder", "50 g", 8],
    ["Acyclovir Cream (5%)", "5 g", 7],
    ["Acyclovir Eye Ointment (3%)", "2 g", 14.2],
    ["Acyclovir Injection Vial", "250 mg", 35],
    ["Acyclovir Suspension", "20 mL", 65],
    ["Acyclovir Tablet", "200 mg", 0.8],
    ["Adrenaline Injection (1:1,000)", "1 mL", 0.5],
    ["Adrenaline Injection (1:10,000)", "1 mL", 5.2],
    ["Adriamycin Injection", "50 mg", 35],
    ["Albendazole Syrup", "20 mL", 1.4],
    ["Albendazole Tablet", "200 mg", 0.8],
    ["Albendazole Tablet", "400 mg", 1.6],
    ["Allopurinol Tablet", "100 mg", 0.13],
    ["Allopurinol Tablet", "300 mg", 0.15],
    ["Aluminium Hydroxide Mixture", "200 mL", 2.3]
];

// super basic routing based on page hashes
function toggle_page() {
    $(".toggleable").addClass("hidden");
    $(window.location.hash).fadeIn(200).removeClass("hidden");
    if (window.location.hash == "#page-map") initialize(); // for map
    if (window.location.hash == "#page-drugs") render_drug_list(); // for drugs
    if (window.location.hash == "") $("#page-welcome").fadeIn(200).removeClass("hidden");
}
window.location.hash = ""; // clear hash on reload
window.addEventListener("hashchange", toggle_page);
function set_hash(h) { window.location.hash = h; }

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

        function mapClickDelegate (marker, i) {
            return function() {
                map.panTo(marker.getPosition());
                rerender_just(i);
            };
        };

        google.maps.event.addListener(myCenter, 'click', mapClickDelegate(myCenter, i));
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
        "<div class='map-item' onclick='rerender_just("+i+")'>" +
        "<em class='pull-right'>" + (+healthLoc[i]["dist"].toFixed(2)) + " km</em>" +
        "<span class='glyphicon glyphicon-map-marker'></span> " +
        healthLoc[i][0] +
        "</div>"
      );
    }

    $('.map-item').each(function () { $(this).collapse(); });
}

function rerender_just(i) {
   $('#map-locations').html(
        "<div class='map-item itemindex-"+ i + "'>" +
        "<em class='pull-right'>" + (+healthLoc[i]["dist"].toFixed(2)) + " km</em>" +
        "<span class='glyphicon glyphicon-map-marker'></span> " +
        healthLoc[i][0] +
        "<br /><p>Type: " + healthLoc[i][4] + "</p>" +
        "<p>Call: " + healthLoc[i][3] + "</p></div>"
    );
}

// basic template for drugs
function render_drug_list() {
    for (var i = 0; i < healthMed.length; i++) {
        $("#drug-list").append(
            "<div class='drug-item' data-drugname='" + healthMed[i][0] + "'>" +
            "<span class='glyphicon glyphicon-ok'></span> " +
            healthMed[i][0] + "<br /><em>" + healthMed[i][2] + "GHS per " + healthMed[i][1] + "</em></div>"
        );
    }
    
    // initialize bootstrap's collapsible behavior
    $('.drug-item').each(function () { $(this).collapse(); });
    
    $("#drug-filter").change(function () {
        var filter = $("#drug-filter").val().toLowerCase();
        $('.drug-item').each(function (i) {
            var drug = $(this).data( "drugname" ).toLowerCase();
            if (drug.indexOf(filter) > -1) {
                $(this).collapse('show');
            }
            else {
                $(this).collapse('hide');
            }
        });
    });
}