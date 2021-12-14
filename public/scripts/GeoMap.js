//the actual token will be passed here where mapToken is present as

// const campground = require("../../models/campground");

// when this script loads,mapToken variable is already defined so it will be passed onto here so that this function runs 
  mapboxgl.accessToken = mapToken;
  const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v11', // style URL
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 9 // starting zoom
  });
 //marker
 new mapboxgl.Marker()
 .setLngLat(campground.geometry.coordinates)
 .addTo(map);