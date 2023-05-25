function getWeather() {
  var locationInput = document.getElementById("locationInput");
  var areaName = locationInput.value;
  var weatherInfo = document.getElementById("weatherInfo");

  var url = 'https://api.openweathermap.org/data/2.5/weather?q=' + areaName + '&appid=136609dbc6546e40f62114280c68ef15';

  // Make an AJAX request to fetch weather data
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function () {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);

      var temperatureKelvin = response.main.temp + " °K";
      var temperatureCelsius  = (response.main.temp - 273.15).toFixed(2) + " °C";
      var minTemperatureCelsius  = (response.main.temp_min - 273.15).toFixed(2) + " °C";
      var maxTemperatureCelsius  = (response.main.temp_max - 273.15).toFixed(2) + " °C";
      var feelsLikeTemperatureCelsius  = (response.main.feels_like - 273.15).toFixed(2) + " °C";
      var clouds = response.clouds.all + " %";
      var pressure = response.main.pressure + " hPa";
      var humidity = response.main.humidity + " %";
      var windSpeed = response.wind.speed + "  meter/sec";
      var windDirectionDegree = response.wind.deg + " °";
      // var windGust = response.wind.gust + "  meter/sec";
      var weatherDescription = response.weather[0].description;
      var country = response.sys.country;

      // Display the weather information
      document.querySelector(".Temperature").innerHTML = `Temperature: ${temperatureCelsius} /  ${temperatureKelvin}`
      document.querySelector(".MinMax").innerHTML = `Min: ${minTemperatureCelsius} - Max: ${maxTemperatureCelsius} - feels Like: ${feelsLikeTemperatureCelsius}`
      document.querySelector(".Wind-Speed").innerHTML = `Wind Speed:  ${windSpeed}`
      document.querySelector(".Wind-DD").innerHTML = `Wind Direction Degree:  ${windDirectionDegree}`
      // document.querySelector(".WindGust").innerHTML = `Wind Gust:  ${windGust}`
      document.querySelector(".Clouds").innerHTML = `Clouds:  ${clouds}`
      document.querySelector(".Humidity").innerHTML = `Humidity:  ${humidity}`
      document.querySelector(".Pressure").innerHTML = `Pressure:  ${pressure}`
      document.querySelector(".Weather").innerHTML = `Weather:  ${weatherDescription}`
      document.querySelector(".country").innerHTML = `country: ${country}`

    } else {
      weatherInfo.innerHTML = "Error fetching weather data. Please try again.";
    }
  };
  xhr.send();
}
// ################################# start Map ################################################
require([
    "esri/rest/locator",
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/Search",
    "esri/widgets/ScaleBar",
    "esri/geometry/Point",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/PopupTemplate",
    "esri/widgets/Popup",
    "esri/request",
    "esri/widgets/Print"
  ], function (locator,Map, MapView, Search, ScaleBar, Point, Graphic, GraphicsLayer,PopupTemplate, Popup, esriRequest, Print) {
    const map = new Map({
      basemap: "streets-navigation-vector"
    });
    const view = new MapView({
      container: "viewDiv",
      map: map,
      zoom : 4,
      center: [30.062, 31.249] // Default center coordinates (Cairo)
    });
    // ################################ End map #################################
    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);
  
    var searchBtn = document.querySelector(".search-btn")
  searchBtn.onclick = function searchLocation() {
      var latInput = document.getElementById("latInput").value;
      var longInput = document.getElementById("longInput").value;
  
      if (latInput && longInput) {
        var lat = parseFloat(latInput);
        var long = parseFloat(longInput);
  
        if (!isNaN(lat) && !isNaN(long)) {
          var point = new Point({
            latitude: lat,
            longitude: long
          });
  
          var markerSymbol = {
            type: "simple-marker",
            color: [226, 119, 40],
            outline: {
              color: [255, 255, 255],
              width: 2
            }
          };
  
          var graphic = new Graphic({
            geometry: point,
            symbol: markerSymbol
          });
  
          graphicsLayer.removeAll();
          graphicsLayer.add(graphic);
  
          view.goTo({
            target: point,
            zoom: 12
          });
          
        // Create a popup template for the location information
        var popupTemplate = new PopupTemplate({
          title: "Location Information",
          content: [
            {
              type: "text",
              text: `<b>Latitude:</b> {latitude}<br><b>Longitude:</b> {longitude}`
            },
            {
              type: "text",
              text: "<br><b>Weather Information:</b><br>{weatherInfo}"
            }
          ]
        });

        // Create a popup instance with the popup template
        var popup = new Popup({
          view: view,
          content: popupTemplate
        });

        // Set the popup content with the searched location coordinates and weather data
        popup.content = ("{latitude}", lat + "{longitude}", long);

        // Fetch the weather data for the searched location
        var weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=136609dbc6546e40f62114280c68ef15`;
        esriRequest(weatherUrl, {
          responseType: "json"
        }).then(function (response) {
          var weatherData = response.data;
          
          var temperature = (weatherData.main.temp - 273.15).toFixed(2) + " °C";
          var tempKelvin = (weatherData.main.temp).toFixed(2)+ " °K";
          var pressure = weatherData.main.pressure + " hPa";
          var humidity = weatherData.main.humidity + " %";
          var windSpeed = weatherData.wind.speed + " meter/sec";
          var windDirectionDegree = weatherData.wind.deg;
          var clouds = weatherData.clouds.all;
          var weatherDescription = weatherData.weather[0].description;

          var weatherInfo = `Temperature: ${temperature} / ${tempKelvin}<br>
           Pressure: ${pressure}<br>
           Humidity: ${humidity}<br>
           Wind Speed: ${windSpeed}<br>
           Wind Direction Degree: ${windDirectionDegree}<br>
           Clouds: ${clouds}<br>
           Weather: ${weatherDescription}`;

          // Update the popup content with the weather data
          popup.content = ("{weatherInfo}", weatherInfo);
        }).catch(function (error) {
          console.error("Error fetching weather data:", error);
        });

        // Open the popup at the searched location
        view.popup = popup;
        view.popup.open({
          title: `Your Location : [ Lat: ${latInput} , long: ${longInput} ]`,
          location: point
        });
        }
      }
  }
    // ############################### start widget #####################################
    // home 
    document.querySelector(".map-home").onclick = function () {
      view.center = [30.062, 31.249]
      view.zoom = 4
    }
    // Scale bar
    let scaleBar = new ScaleBar({
        view: view,
        unit: "dual"
    });
    view.ui.add(scaleBar, {
        position: "bottom-left"
    });
    // Search
    const searchWidget = new Search({
        view: view
    });
    view.ui.add(searchWidget, {
        position: "top-right",
        index: 2
    });
// ############################### end widget #####################################
  view.popup.autoOpenEnabled = false;
  view.on("click", (e) => {
    // Get the coordinates of the click on the view
    // around the decimals to 3 decimals
    var lati = Math.round(e.mapPoint.latitude * 1000 ) / 1000
    var longi = Math.round(e.mapPoint.longitude * 1000 ) / 1000

    // Create a popup template for the location information
    var popupTemplate = new PopupTemplate({
      title: "weather Information",
      content: [
        {
          type: "text",
          text: `<b>Latitude:</b> {latitude}<br><b>Longitude:</b> {longitude}`
        },
        {
          type: "text",
          text: "<br><b>Weather Information:</b><br>{weatherInfo}"
        }
      ]
    });

    // Create a popup instance with the popup template
    var popup = new Popup({
      view: view,
      content: popupTemplate
    });

    // Set the popup content with the searched location coordinates and weather data
    popup.content = ("{latitude}", lati + "{longitude}", longi);

    // Fetch the weather data for the searched location
    var weaUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lati}&lon=${longi}&appid=136609dbc6546e40f62114280c68ef15`;
    esriRequest(weaUrl, {
      responseType: "json"
    }).then(function (response) {
      var weatherData = response.data;
      
      var temperature = (weatherData.main.temp - 273.15).toFixed(2) + " °C";
      var tempKelvin = (weatherData.main.temp).toFixed(2)+ " °K";
      var pressure = weatherData.main.pressure + " hPa";
      var humidity = weatherData.main.humidity + " %";
      var windSpeed = weatherData.wind.speed + " meter/sec";
      var windDirectionDegree = weatherData.wind.deg;
      var clouds = weatherData.clouds.all;
      var weatherDescription = weatherData.weather[0].description;

      var weatInfo = `Temperature: ${temperature} / ${tempKelvin}<br>
        Pressure: ${pressure}<br>
        Humidity: ${humidity}<br>
        Wind Speed: ${windSpeed}<br>
        Wind Direction Degree: ${windDirectionDegree}<br>
        Clouds: ${clouds}<br>
        Weather: ${weatherDescription}`;

      // Create a locator url using the world geocoding service
      var locatorUrl = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

      const params = {
          location: e.mapPoint
      };
      // Execute a reverse geocode using the clicked location
      locator
          .locationToAddress(locatorUrl, params)
          .then((response) => {
      // If an address is successfully found, show it in the popup's content
          view.popup.content = `${weatInfo}<br> 
                                ${response.address}`;
      }).catch(() => {
      // If the promise fails and no result is found, show a generic message
          view.popup.content = "No address was found for this location";
      });
      });
        view.popup = popup;
        view.popup.open({
          // Set the popup's title to the coordinates of the clicked location
          title: `Your Location : [ Lat: ${lati} , long: ${longi} ]`,
          location: e.mapPoint, // Set the location of the popup to the clicked location
      })

}) // end view.on ()
});
// Show Modal
const openModalButton = document.getElementById("open-modal");
const modalWindowOverlay = document.getElementById("modal-overlay");
const showModalWindow = () => {
  modalWindowOverlay.style.display = 'flex';
}
openModalButton.addEventListener("click", showModalWindow);
// Hide Modal
const closeModalButton = document.getElementById("close-modal");
const hideModalWindow = () => {
    modalWindowOverlay.style.display = 'none';
}
closeModalButton.addEventListener("click", hideModalWindow);
// Hide On Blur
const hideModalWindowOnBlur = (e) => {
    if(e.target === e.currentTarget) {
      console.log(e.target === e.currentTarget)
        hideModalWindow();
    }
}
modalWindowOverlay.addEventListener("click", hideModalWindowOnBlur)