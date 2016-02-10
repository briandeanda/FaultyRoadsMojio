(function() {
    var App, MojioClient, buildMojioMap, config, mojio_client;

    MojioClient = this.MojioClient;

    config = {
        application: '019b54e6-775b-4279-a966-9eb628d506cc', // Fill in your app id here!
        redirect_uri: 'http://localhost:63342/FaultyRoads/index.html', // Fill in you redirect uri here! (Ex. 'http://localhost:4093/index.html')
        hostname: 'api.moj.io',
        version: 'v1',
        port: '443',
        scheme: 'https',
        live: false // or true (Sandbox and Live are now one server so this value won't have an effect!)
    };

    mojio_client = new MojioClient(config);

    App = mojio_client.model('App');

    $(function() {
        var div;
        // Don't actually replace values here. This is just a check incase you forgot to replace them in the config above!
        if (config.application == '[YOUR APP ID GOES HERE]') {
            div = document.getElementById('result');
            div.innerHTML += 'Mojio Error:: Set your application key in myFirstMojioApp source code';
            return;
        }
        // Don't actually replace values here. This is just a check incase you forgot to replace them in the config above!
        if (config.redirect_uri == '[YOUR REDIRECT URI GOES HERE]') {
            div = document.getElementById('result');
            div.innerHTML += 'Mojio Error:: Set a redirect_uri in myFirstMojioApp source code.';
            return;
        }
        mojio_client.token(function(error, result) {
            if (error) {
                console.log("Hey: "+error);
                console.log("redirecting to login.");
                return mojio_client.authorize(config.redirect_uri);
            } else {
                alert("Authorization Successful.");
                div = $("#welcome");
                mojio_client.get(mojio_client.model("User"), {
                    id: result.UserId
                }, function(error, result) {
                    var message;
                    message = 'Viewing the location of ';
                    if (result.FirstName) {
                        message += result.FirstName;
                    } else if (result.UserName) {
                        message += result.UserName;
                    } else if (result.LastName) {
                        message += result.LastName;
                    } else if (result.Email) {
                        message += result.Email;
                    } else {
                        message += "Unknown";
                    }
                    message += '';
                    div = $("#welcome");
                    return div.append(message);
                });
                return mojio_client.get(mojio_client.model("Vehicle"), {}, function(error, result) {
                    var i, lat, lng;
                    lat = [];
                    lng = [];
                    i = 0;
                    $.each(result.Data, function(key, value) {
                        if ((value.LastLocation != null) && (value.LastLocation.Lat != null) && (value.LastLocation.Lng != null)) {
                            lat[i] = value.LastLocation.Lat;
                            lng[i] = value.LastLocation.Lng;
                            return i++;
                        }
                    });
                    div = $("#result");
                    if (lat.length > 0) {
                        div.html('The vehicle is at: ' + lat[0] + ", " + lng[0]);
                        buildMojioMap(lat[0], lng[0]);
                    } else {
                        return div.html("No vehicle detected!");
                    }
                });
            }
        });
        return $("#button").click(function() {
            return mojio_client.unauthorize(config.redirect_uri);
        });
    });

}).call(this);

buildMojioMap = function(mojioLat, mojioLng) {
    var map;
    map = new GMaps({
        el: '#map',
        lat: mojioLat,
        lng: mojioLng,
        panControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        overviewMapControl: false
    });
    return setTimeout(function() {
        return map.addMarker({
            lat: mojioLat,
            lng: mojioLng,
            animation: google.maps.Animation.DROP,
            draggable: false,
            title: 'Current Mojio Location'
        }, 1000);
    });
};