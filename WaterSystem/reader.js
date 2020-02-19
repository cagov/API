const fs = require('fs');
const geolib = require('geolib');

// systemGeoJson = JSON.parse(fs.readFileSync('./drinking-water-water-systems-boundaries-json.json', 'utf8'));
// systemGeoJson = JSON.parse(fs.readFileSync('./test.json', 'utf8'));
// systemGeoJson = JSON.parse(fs.readFileSync('./small.json', 'utf8'));
systemGeoJson = JSON.parse(fs.readFileSync('./watersystems.json', 'utf8'));
let respBody = 'no match';

systemGeoJson.features.forEach((system) => {
  if (system.geometry) {
    system.geometry.coordinates.forEach((shapeSet) => {
      // console.log('---------------'+system.properties.pwsid)
      // console.log(shapeSet)
      shapeSet.forEach((shapePoints) => {
        let refinedGeometry = [];
        shapePoints.forEach((shape) => {
          let obj = {}
          obj.latitude = shape[1];
          obj.longitude = shape[0];
          refinedGeometry.push(obj);
        })
        // console.log(refinedGeometry.length)
        let haywardLoc = { latitude: 37.809296, longitude: -122.242349 };
        let brentwoodLoc = { latitude: 37.923749, longitude: -121.737861 };
        let berkeleyLoc = { latitude: 37.858996, longitude: -122.271022 };
        let inPolygon = geolib.isPointInPolygon(berkeleyLoc, refinedGeometry);
        // console.log(inPolygon);
        if (inPolygon) {
          console.log(system.properties)
          respBody = JSON.stringify(system)
        }
      })
    })
  }
})

console.log('done')