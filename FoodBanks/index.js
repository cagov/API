const foodData = require('./foods.json');
const haversine = require('haversine');

module.exports = async function (context, req) {
  if (req.query.lat || (req.body && req.body.lon)) {
    let position = [parseFloat(req.query.lon),parseFloat(req.query.lat)];
    let coords = { type: 'Feature', geometry: { coordinates: position } };    
    var sortedLocs = foodData.features.sort(function (a, b) {
      return haversine(coords, a, { format: 'geojson', unit: 'mile' }) - haversine(coords, b, { format: 'geojson', unit: 'mile' })
    })
    var outputLocs = [];
    for (let i = 0; i < 9; i++) {
      let food = sortedLocs[i];
      if (food) {
        food.properties.distance = haversine(coords, food, { format: 'geojson', unit: 'mile' });
        outputLocs.push(food);
      }
    }
    context.res = {
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(outputLocs)
    };
  } else {
    context.res = {
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(foodData)
    };
  }
};