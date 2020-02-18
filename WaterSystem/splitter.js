let latitudeNearVisalia = 37.046741;
let leftOfSac = -121.868589;

const fs = require('fs');
const geolib = require('geolib');

systemGeoJson = JSON.parse(fs.readFileSync('./unique-water-systems.json', 'utf8'));

let aboveLeftArray = [];
let aboveRightArray = [];
let belowArray = [];

systemGeoJson.features.forEach((system) => {
  if (system.geometry) {
    let above = false;
    let below = false;
    let left = false;
    let right = false;
    system.geometry.coordinates.forEach((shapeSet) => {
      shapeSet.forEach((shapePoints) => {
        shapePoints.forEach((shape) => {
          let latitude = shape[1];
          let longitude = shape[0];
          if(latitude >= latitudeNearVisalia) {
            above = true;
          } else {
            below = true;
          }
          if(longitude >= leftOfSac) {
            left = true;
          }
        })
      })
    })
    if(above) {
      if(left) {
        aboveLeftArray.push(system)
      } else {
        aboveRightArray.push(system)
      }
    }
    if(below) {
      belowArray.push(system)
    }
  }
})

let aboveLeftOutput = {"type": "FeatureCollection","features": []}
let aboveRightOutput = {"type": "FeatureCollection","features": []}
let belowOutput = {"type": "FeatureCollection","features": []}
aboveLeftArray.forEach( (item) => {
  aboveLeftOutput.features.push(item)
})
aboveRightArray.forEach( (item) => {
  aboveRightOutput.features.push(item)
})
belowArray.forEach( (item) => {
  belowOutput.features.push(item)
})

fs.writeFileSync('./water-systems-top-left.json',JSON.stringify(aboveLeftOutput),'utf8')
fs.writeFileSync('./water-systems-top-right.json',JSON.stringify(aboveRightOutput),'utf8')
fs.writeFileSync('./water-systems-bottom.json',JSON.stringify(belowOutput),'utf8')

