//campgrounds is our source because thats the dataset we are using
//and that campground is set as a value to the key->features
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'cluster-map',
style: 'mapbox://styles/mapbox/dark-v10',
center: [-103.5917, 40.6699],
zoom: 3
});
//to add map controls i.e adding zoom and rotation controls to the map
map.addControl(new mapboxgl.NavigationControl());

//  console.log(campgrounds);
//map.on something are the events wea re going to listen for
map.on('load', () => {
// Add a new source from our GeoJSON data and
// set the 'cluster' option to true. GL-JS will
// add the point_count property to your source data.
map.addSource('campgrounds', {//so here we are registering a source referring back to it later in layers
type: 'geojson',
// Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
// from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
data: campgrounds,//this campgrounds defined in index.ejs and passed here
cluster: true,
clusterMaxZoom: 14, // Max zoom to cluster points on
clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
});
 
map.addLayer({ //layer for circle
id: 'clusters',
type: 'circle',
source: 'campgrounds',
filter: ['has', 'point_count'],
paint: {
// Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
// with three steps to implement three types of circles:
//   * Blue, 20px circles when point count is less than 100
//   * Yellow, 30px circles when point count is between 100 and 750
//   * Pink, 40px circles when point count is greater than or equal to 750
'circle-color': [
'step',
['get', 'point_count'],
'#B91646',
10,
'#C72C41',
35,
'#88304E'
 //these controls the size and the shape of the circle depending upon the no of points in it so the number of things in a given cluster
],  
'circle-radius': [
'step',
['get', 'point_count'],
15,
10,
20,
35,
30
]
}
});
 
map.addLayer({
id: 'cluster-count',//for the count of things in a cluster circle i.e text
type: 'symbol',
source: 'campgrounds',
filter: ['has', 'point_count'],
layout: {
'text-field': '{point_count_abbreviated}',
'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
'text-size': 12
}
});
//determine what the point should look like
map.addLayer({
id: 'unclustered-point',//for a unclustered point i.e no cluster just a single point
type: 'circle',
source: 'campgrounds',
filter: ['!', ['has', 'point_count']], 
paint: { //if we not "has" "point-count" then display circle of these configuration
'circle-color': '#781D42',
'circle-radius': 4,
'circle-stroke-width': 1,
'circle-stroke-color': '#CD1818'
}
});
 
// inspect a cluster on click
map.on('click', 'clusters', (e) => {
const features = map.queryRenderedFeatures(e.point, {
layers: ['clusters']
});
const clusterId = features[0].properties.cluster_id;
map.getSource('campgrounds').getClusterExpansionZoom(
clusterId,
(err, zoom) => {
if (err) return;
 
map.easeTo({
center: features[0].geometry.coordinates,//whenever i click on something thats going to be the centre of zoom in
zoom: zoom//zoom when we click on it
});
}
);
});
 
// When a click event occurs on a feature in
// the unclustered-point layer, open a popup at
// the location of the feature, with
// description HTML from its properties.
map.on('click', 'unclustered-point', (e) => { //this function is called when we click on a unclustered point
const {popUpMarkUp}= e.features[0].properties;
const coordinates = e.features[0].geometry.coordinates.slice();//(this function is here to get some data out)

// const mag = e.features[0].properties.mag;
// const tsunami =
// e.features[0].properties.tsunami === 1 ? 'yes' : 'no';
 
// Ensure that if the map is zoomed out such that
// multiple copies of the feature are visible, the
// popup appears over the copy being pointed to.
while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
}
 
new mapboxgl.Popup()
.setLngLat(coordinates)
.setHTML(popUpMarkUp)
.addTo(map);
});
 //when mouse enters over clusters
map.on('mouseenter', 'clusters', () => {
map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'clusters', () => {
map.getCanvas().style.cursor = '';
});
});
