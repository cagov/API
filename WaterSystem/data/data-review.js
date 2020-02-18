const fs = require('fs');

newBounds = JSON.parse(fs.readFileSync('./boundaries.geojson', 'utf8'));
systemGeoJson = JSON.parse(fs.readFileSync('./unique-water-systems.json', 'utf8'));

let unFoundItems = [];

let matches = 0;
newBounds.features.forEach((system) => {
  if (system.geometry) {
    // see if pwsid is already in systemGeoJson

    let matchFound = false;
    systemGeoJson.features.forEach( (item) => {
      if(item.properties.pwsid == system.properties.pwsid) {
        matchFound = true;
        matches++;
      }
    })

    if(!matchFound) {
      unFoundItems.push(system)
    }

  }
})

console.log(unFoundItems.length)
console.log(matches)
console.log(systemGeoJson.features.length)