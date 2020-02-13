//let systemGeoJson = require('./watersystems.json', 'utf8');
let topSystems = require('./water-systems-top.json', 'utf8')
let bottomSystems = require('./water-systems-bottom.json', 'utf8')
// systemGeoJson = require('./drinking-water-water-systems-boundaries-json.json');
const geolib = require('geolib');
const allSystems = require('./all-water-systems-list.json');
let systemMap = new Map();
allSystems.forEach( (system) => {
  systemMap.set(system['Water System No'],system);
})

module.exports = async function (context, req) {
  if (req.query.lat || (req.body && req.body.lon)) {
    // we have a point, find the corresponding systems
    let respBody= [];
    let uniqueFoundSystems = new Map();

    let midPoint = 37.046741;
    let systemGeoJson = bottomSystems;
    if(req.query.lat >= midPoint) {
      systemGeoJson = topSystems;
    }
    systemGeoJson.features.forEach( (system) => {
      if(system.geometry) {
        let inPolygon = false;
        system.geometry.coordinates.forEach( (shapeSet) => {
          shapeSet.forEach( (shapePoints) => {
            let refinedGeometry = [];
            shapePoints.forEach( (shape) => {
              let obj = {}
              obj.latitude = shape[1];
              obj.longitude = shape[0];
              refinedGeometry.push(obj);  
            })
            inPolygon = geolib.isPointInPolygon({ latitude: parseFloat(req.query.lat), longitude: parseFloat(req.query.lon) }, refinedGeometry);
            if(inPolygon) {
              uniqueFoundSystems.set(system.properties.pwsid,system)
            }
          })
        })
      }
    })
    uniqueFoundSystems.forEach( (sys) => {
      if(systemMap.get(sys.properties.pwsid)) {
        sys.properties.systemData = systemMap.get(sys.properties.pwsid);
      }
      respBody.push(sys)
    })
    context.res = {
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(respBody)
    };
  } else {
    context.res = {
      status: 400,
      body: "Please pass a lat and lon on the query string"
    };
  }
};