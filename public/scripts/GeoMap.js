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
 new mapboxgl.Marker() //our marker
 
 //calling methods now on this marker
 .setLngLat(campground.geometry.coordinates)//setting the latitude and longitude so thats where the data going 
 .setPopup(
   new mapboxgl.Popup({offset:25})
    .setHTML(
     `<h3>${campground.title}</h3><p>${campground.location}</p>`
   )
 )
 .addTo(map);