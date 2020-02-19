const fs = require('fs');
const geolib = require('geolib');

// systemGeoJson = JSON.parse(fs.readFileSync('./drinking-water-water-systems-boundaries-json.json', 'utf8'));
// systemGeoJson = JSON.parse(fs.readFileSync('./test.json', 'utf8'));
// systemGeoJson = JSON.parse(fs.readFileSync('./small.json', 'utf8'));
systemGeoJson = JSON.parse(fs.readFileSync('./watersystems.json', 'utf8'));

let idMap = new Map();
let dupCount = 0;
let total = 0;
systemGeoJson.features.forEach((system) => {
  if (system.geometry) {
    total++;
    let existingID = idMap.get(system.properties.pwsid)
    if(existingID) {
      
      dupCount++;
    } else {
      idMap.set(system.properties.pwsid,system)
    }
  }
})

let output = {"type": "FeatureCollection","features": []}
let uniqueCount = 0;
idMap.forEach( (item) => {
  output.features.push(item)
  uniqueCount++
})
output.totalFeatures = uniqueCount;

fs.writeFileSync('./unique-water-systems.json',JSON.stringify(output),'utf8')

console.log('dups '+dupCount)
console.log('total '+total)