/*
Google Maps Javascript
*/


// List of Mammoth Lakes Locations
var PLACES_IN_MAMMOTH = [
    {
        name: "Cinnamon Bear Inn",
        phone: "7609342873",
        listView: true,
        locationType: "Lodging",
        location: { lat: 37.646934, lng: -118.971888 }
    },
    {
        name: "Quality Inn",
        phone: "7609345114",
        listView: true,
        locationType: "Lodging",
        location: { lat: 37.648242, lng: -118.975139 }
    },
    {
        name: "Innsbruck Lodge",
        phone: "7609343035",
        listView: true,
        locationType: "Lodging",
        location: { lat: 37.651181, lng: -118.982188 }
    },
    {
        name: "Rodeway Inn Wildwood Inn",
        phone: "7609346855",
        listView: true,
        locationType: "Lodging",
        location: { lat: 37.649133, lng: -118.976446 }
    },
    {
        name: "M Inn Mammoth",
        phone: "7609342710",
        listView: true,
        locationType: "Lodging",
        location: { lat: 37.647426, lng: -118.976800 }
    },
    {
        name: "Shilo Inn Suites",
        phone: "7609650544",
        listView: true,
        locationType: "Lodging",
        location: { lat: 37.646093, lng: -118.964614 }
    },
    {
        name: "Travelodge",
        phone: "8007606483",
        listView: true,
        locationType: "Lodging",
        location: { lat: 37.649304, lng: -118.974173 }
    },
    {
        name: "Alpenhof Lodge",
        phone: "7609346330",
        listView: true,
        locationType: "Lodging",
        location: { lat: 37.650034, lng: -118.983540 }
    },
    {
        name: "Giovanni's Pizzeria",
        phone: "7609347563",
        listView: true,
        locationType: "Restaurant",
        location: { lat: 37.639957, lng: -118.964398 }
    },
    {
        name: "Roberto's Mexican Cafe",
        phone: "7609343667",
        listView: true,
        locationType: "Restaurant",
        location: { lat: 37.642300, lng: -118.966000 }
    },
    {
        name: "Starbucks",
        phone: "7609340698",
        listView: true,
        locationType: "Restaurant",
        location: { lat: 37.651195, lng: -118.985324 }
    },
    {
        name: "Mammoth Brewing Company",
        phone: "7609347141",
        listView: true,
        locationType: "Restaurant",
        location: { lat: 37.648632, lng: -118.983435 }
    },
    {
        name: "Minaret Village Shopping Center",
        phone: "7609346005",
        listView: true,
        locationType: "Shopping",
        location: { lat: 37.639138, lng: -118.964294 }
    },
    {
        name: "Vons / Starbucks",
        phone: "7609344536",
        listView: true,
        locationType: "Shopping",
        location: { lat: 37.638545, lng: -118.965243 }
    },
    {
        name: "Mammoth Fun Shop",
        phone: "7609241111",
        listView: true,
        locationType: "Shopping",
        location: { lat: 37.646967, lng: -118.968285 }
    },
    {
        name: "McCoy's Mammoth Memories",
        phone: "7609247070",
        listView: true,
        locationType: "Shopping",
        location: { lat: 37.650671, lng: -118.985323 }
    },
    {
        name: "Mammoth Rock 'n' Bowl / Mammoth Rock Brasserie",
        phone: "7609344200",
        listView: true,
        locationType: "Entertainment",
        location: { lat: 37.638066, lng: -118.965007}
    },
    {
        name: "Minaret Cinemas",
        phone: "7609343131",
        listView: true,
        locationType: "Entertainment",
        location: { lat: 37.638921, lng: -118.964530}
    }
];

// Variables placed in the global scope to ensure it only has one value at all times
var map, bounds, infowindow, infoWindowOptions, mapCenter;

// Initialize markers array
var markers = [];

var MarkerModel = function(item) {

    /*
    ** This is the model for the markers that are placed on the Google Map and in the dropdown menu.
    ** Knockout observables:
    **      listView : boolean variable used for filtering list view
    **
    ** Variables:
    **      name : name of location
    **      phone : phone number of location, used for Yelp API business search
    **      locationType : type of location , used for filtering marker and list view
    **      location : Google LatLng Object
    **      marker : Google Marker Object
    **
    ** previewOn(), previewOut(), selectMarker() : functions activated by Knockout events in the list view
    **
    ** makeMarkerIcon : creates a customized marker color activated by marker listener events
    ** populateInfoWindow : activated by Knockout event in list view or marker listener event on the map,
    **                      performs AJAX call to Yelp Business Search API using the phone number, parses received
    **                      data and creates the Google InfoWindow Object. Calls to Yelp API require OAuth authorization.
    **                      This is performed with the help of Mnemonicflow's Yelp OAuth JS scripts.
    */

    var self = this;

    // Variables that define the custom marker look and calls makeMarkerIcon() to create them
    var defaultMarker = makeMarkerIcon('76F5F3', '360CF3');
    var highlightedMarker = makeMarkerIcon('360CF3', '76F5F3');

    self.name = item.name; //ko.observable(item.name);
    self.phone = item.phone; //ko.observable(item.phone);
    self.locationType = item.locationType; //ko.observable(item.locationType);
    self.listView = ko.observable(item.listView);
    self.location = item.location; // ko.observable(item.location);
    self.marker = new google.maps.Marker({
        position: this.location,
        title: this.name,
        map: map,
        icon: defaultMarker,
        animation: google.maps.Animation.DROP
    });

    // Add marker location to bounds to resize map and fit all markers
    bounds.extend(self.location);

    // Add event listeners for markers on the map
    self.marker.addListener('mouseover', function() {
        this.setIcon(highlightedMarker);
    });
    self.marker.addListener('mouseout', function() {
        this.setIcon(defaultMarker);
    });
    self.marker.addListener('click', function() {
        populateInfoWindow();
    });

    // Knockout events
    self.previewOn = function() {
        self.marker.setIcon(highlightedMarker);
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(-1);
        }, 1400);
    };
    self.previewOut = function() {
        self.marker.setIcon(defaultMarker);
        self.marker.setAnimation(-1);
    };
    self.selectMarker = function() {
        map.setZoom(16);
        self.marker.setIcon(highlightedMarker);
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(-1);
        }, 1400);
        populateInfoWindow();
    };

    // Changes the look of the marker icon
    function makeMarkerIcon(markerColor, markerCenter) {
        var markerImage = new google.maps.MarkerImage(
            'https://chart.apis.google.com/chart?chst=d_map_pin_letter_withshadow&chld=%E2%80%A2|' + markerColor + '|' + markerCenter
        );
        return markerImage;
    }

    // Populates infowindow after successful AJAX call to Yelp API
    function populateInfoWindow() {
        if (infowindow.marker === self.marker) {
            console.log('marker already selected');
        } else {
            map.panTo(self.location);
            infowindow.marker = self.marker;
            infowindow.setContent('retrieving information...');
            var message = {
                'action': 'https://api.yelp.com/v2/phone_search?phone=' + self.phone + '&cc=US',
                'method': 'GET',
                'parameters': parameters
            };

            OAuth.setTimestampAndNonce(message);
            OAuth.SignatureMethod.sign(message, accessor);
            var parameterMap = OAuth.getParameterMap(message.parameters);
            $.ajax({
                'url': message.action,
                'data': parameterMap,
                'dataType': 'jsonp',
                'jsonpCallback': 'cb',
                'timeout': 8000,
                'cache': true
            })
            .done( function(data, textStatus, jqXHR) {
                var businessInfo = JSON.parse(JSON.stringify(data.businesses[0]));
                console.log('status[' + textStatus + ']');
                var yName, yRating, yDisplayPhone, yAddress, ySnippet, yURL;
                yName = businessInfo.name  || 'Business Name Unavailable';
                yRating = businessInfo.rating || 'not available';
                yDisplayPhone = businessInfo.display_phone || 'Phone number not provided';
                yAddress = businessInfo.location ? businessInfo.location.display_address : 'Address unavailable.'; //businessInfo.location.display_address || 'Address not provided';
                ySnippet = businessInfo.snippet_text || 'Review snippet unavailable';
                yURL = businessInfo.url || 'http://www.yelp.com';
                var contentString = '<div id="yelpInfoWindow">' +
                                        '<div id="yelpHeader">' +
                                            '<div id="yelpImgLogo"><a href="'+ yURL + '" target="_blank"><img id="yelpLogo" src="images/Yelp_trademark_RGB.png" alt="Yelp Logo"></a></div>' +
                                            '<div id="yelpBusinessName">' + yName + '</div>' +
                                        '</div><!-- /#yelpHeader -->' +
                                        '<div id="yelpBusinessInfo">' +
                                            '<img id="yelpImg" src="' + businessInfo.image_url + '" alt="' + yName + '">' +
                                            '<img id="yelpRatings" src="' + businessInfo.rating_img_url + '" alt="rating: ' + yRating + '">' +
                                            '<div><span class="glyphicon glyphicon-phone-alt"></span> <a id="yelpPhone" href="tel:' + businessInfo.phone + '">' + yDisplayPhone + '</a></div>' +
                                            '<span id="yelpBusinessAddress">' + yAddress + '</span><br>' +
                                            '<div><span id="yelpSnippet">' + ySnippet + '</span>' +
                                            '<span><a id="yelpBusinessLink" href="' + yURL + '" target="_blank" alt="Yelp Link"> Read More </a></span></div>' +
                                        '</div><!-- /#yelpBusinesInfo -->' +
                                    '</div><!-- /#yelpInfoWindow -->';
                infowindow.setContent(contentString);
            })
            .fail( function( jqXHR, textStatus, errorThrown) {
                console.log('error[' + errorThrown + '], status[' + textStatus + ']');
                infowindow.setContent('Error: Connection timed out. Please try again later.');
            })
            .always( function() {
                infowindow.open( map, self.marker );
            });
        }
        infowindow.addListener('closeclick', function() {
            map.fitBounds(bounds);
            infowindow.marker = null;
        });
    }
};

var WeatherModel = function() {

    /*
    ** This model is for weather. When the page loads, an AJAX call to the Dark Sky API is called
    ** Knockout observables:
    **      weatherIcon : contains the information to build the 'current weather icon'
    **      weatherSummary : contains the text description of the current weather
    */

    var self = this;

    self.weatherIcon = ko.observable();
    self.weatherSummary = ko.observable('fetching weather...');
    self.results = ko.observable(null);
    var DARK_SKY_URL = "https://api.darksky.net/forecast/";
    var DARK_SKY_KEY = "19d44a25d3797ee6bb826a9c306e6d4c";
    var DARK_SKY_LOC = { lat: 37.649123, lng: -118.977546 };
    var weatherApiUrl = DARK_SKY_URL + DARK_SKY_KEY + '/' + DARK_SKY_LOC.lat + ',' + DARK_SKY_LOC.lng;

    $.ajax({
        url: weatherApiUrl,
        dataType: "jsonp",
        timeout: 15000
    })
    .done(function(response) {
        self.weatherIcon('<i class="wi wi-forecast-io-' + response.currently.icon + '"></i>');
        self.weatherSummary(response.currently.summary);
    })
    .fail( function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus, errorThrown);
        self.weatherSummary('Error: unable to fetch weather. Please try again later...');
    });
};

var AppViewModel = function() {

    /*
    ** This is the view model for the Knockout bindings.
    ** Knockout variables:
    **      mapMarkers : Array of modelMarkers
    **      locationType : Array of location types that used to filter mapMarkers
    **      selectedLocationType : Observable to hold the value of the locationType for filtering
    **      showMenuWindow : CSS binding to toggle visibility of #menu-window
    **      that.viewWidth : Observable to monitor width of viewport to determine if showMenuWindow is toggled after load
    **      filterMarkers : Computed observable that filters the list view and sets the visibility of
    **                      each marker based on selectedLocadtionType(). It also closes any open infowindow
    **                      and sets infowindow.marker to null whenever the filter is changed.
    */

    var that = this;
    that.currentWeather = ko.observable();
    that.mapMarkers = ko.observableArray([]);
    that.locationType = ko.observableArray(['All']);
    that.selectedLocationType = ko.observable('All');
    that.showMenuWindow = ko.observable(true);
    that.viewWidth = ko.observable(window.innerWidth);

    that.filterMarkers = ko.computed(function() {
        infowindow.close();
        infowindow.marker = null;
        map.fitBounds(bounds);
        for (var i = 0; i < that.mapMarkers().length; i++) {
            if (that.selectedLocationType() == 'All') {
                that.mapMarkers()[i].marker.setVisible(true);
                that.mapMarkers()[i].marker.setAnimation(google.maps.Animation.DROP);
                that.mapMarkers()[i].listView(true);
            } else {
                that.mapMarkers()[i].marker.setVisible(false);
                that.mapMarkers()[i].listView(false);
                if (that.selectedLocationType() == that.mapMarkers()[i].locationType) {
                    that.mapMarkers()[i].marker.setVisible(true);
                    that.mapMarkers()[i].marker.setAnimation(google.maps.Animation.DROP);
                    that.mapMarkers()[i].listView(true);
                }
            }
        }
    });

    // Get current weather
    that.currentWeather(new WeatherModel());

    // Create a new MarkerModel object and push to mapMarkers().
    PLACES_IN_MAMMOTH.forEach(function(location) {
        that.mapMarkers.push(new MarkerModel(location));
    });

    // Sort mapMarkers by name
    that.mapMarkers.sort(function(one, two) {
        return one.name == two.name ? 0 : (one.name < two.name ? -1 : 1);
    });

    // Populate locationType observable array
    for (var i = 0; i < that.mapMarkers().length; i++) {
        if(!that.locationType().includes(that.mapMarkers()[i].locationType)) {
            that.locationType.push(that.mapMarkers()[i].locationType);
        }
    }

    // Sort locationType alphabetically
    that.locationType().sort();

    // Toggles the visibility of the menu window. Only visible when screen is <= 768px.
    that.toggleMenuWindow = function() {
        that.showMenuWindow(!that.showMenuWindow());
        $("#menu-toggle-button").find("span").toggleClass('glyphicon-remove').toggleClass('glyphicon-menu-hamburger');
    };

    // Resize map to fit all markers
    map.fitBounds(bounds);

    // Listener to resize map to fit all markers, and call togglesMenuWindow() if user changes window size
    google.maps.event.addDomListener(window, 'resize', function() {
        map.fitBounds(bounds);
        that.viewWidth(window.innerWidth);
        if (that.viewWidth() > 768 && !that.showMenuWindow()) {
            that.toggleMenuWindow();
        }
    });
};

function loadFailure() {

    /*
    ** This function is a fallback function in case the call to Google Maps API fails.
    */

    alert("A fatal error has occurred while loading this page. Please refresh the page or try again later.");
}

function initMap() {

    /*
    ** This function initializes the Google Map API and KnockoutJS binding
    */

    if (typeof google !== 'object') {
        alert("Unable to load Google Maps at this time. Please try again later.")
        return;
    }

    // Custom map styling created using https://mapstyle.withgoogle.com/ | minified
    var styles = [{"elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f5f5"}]},{"featureType":"administrative.neighborhood","stylers":[{"visibility":"off"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"landscape","stylers":[{"color":"#eef0f0"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#cccccc"},{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.business","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"geometry","stylers":[{"color":"#b9fa99"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#cbfac7"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#66ccff"}]},{"featureType":"road.arterial","stylers":[{"color":"#66ccff"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#66ccff"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"road.local","stylers":[{"visibility":"simplified"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#000000"},{"visibility":"off"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#cdfdff"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]}];

    // Initialize and create map
    map = new google.maps.Map(document.getElementById('map'), {
        center: PLACES_IN_MAMMOTH[0].location,
        zoom: 20,
        mapTypeControl: false,
        disableDoubleClickZoom: true,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: false,
        styles: styles
    });

    // Initialize infowindow and bounds
    infowindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();

    // Apply ViewModel
    ko.applyBindings( new AppViewModel() );
}
