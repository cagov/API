// read all ids
// fetch single but just pwsid from system
// review pwsid in systemGeoJson

const fs = require('fs');
const fetch = require('node-fetch');

systemGeoJson = JSON.parse(fs.readFileSync('../unique-water-systems.json', 'utf8'));

allIds = JSON.parse(fs.readFileSync('./ids.json', 'utf8')).objectIds;

let delay = 200;
let count = 1;
let pwsids = [];
allIds.forEach( (id) => {
  count++;
  setTimeout(function() {
    fetch('https://gispublic.waterboards.ca.gov/portalserver/rest/services/Hosted/California_Drinking_Water_Service_Areas/FeatureServer/0/query?where=1%3D1&objectIds='+id+'&time=&geometry=&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=pwsid&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnCentroid=false&sqlFormat=standard&resultType=&f=geojson')
    .then((response) => {
      const contentType = response.headers.get('content-type');
      return response.text();
    })
    .then((data) => {
      let parsedData = JSON.parse(data)
      let thispwsid = parsedData.features[0].properties.pwsid;
      console.log(thispwsid)
      pwsids.push(thispwsid)
    })
    .catch((error) => console.error(error));
  }, delay * count)
})

function checkMatch(pwsid) {
  let matchFound = false;
  systemGeoJson.features.forEach( (item) => {
    if(item.properties.pwsid == system.properties.pwsid) {
      matchFound = true;
    }
  })
  
  if(!matchFound) {
    return false;
  }
  return true;
}
