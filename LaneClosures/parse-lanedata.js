const geolib = require('geolib');

module.exports = function parseLCS(lcs, direction, bbox) {
  let finalObstructions = [];
  let possibles = [];
  if(direction) {
    lcs.forEach( (issue) => {
      if(issue.lcs.location.travelFlowDirection.toLowerCase().indexOf(direction.toLowerCase()) > -1) {
        possibles.push(issue);
      }
    })  
  } else {
    possibles = lcs;
    console.log("NO DIRECTIONS")
  }

  possibles.forEach( (issue) => {
    let lon = issue.lcs.location.begin.beginLongitude;
    let lat = issue.lcs.location.begin.beginLatitude;
    /*
    let inPoly = geolib.isPointInPolygon({ latitude: lat, longitude: lon }, [
      { latitude: coords.startCoords[1], longitude: coords.startCoords[0] },
      { latitude: coords.endCoords[1], longitude: coords.startCoords[0] },
      { latitude: coords.endCoords[1], longitude: coords.endCoords[0] },
      { latitude: coords.startCoords[1], longitude: coords.endCoords[0] },
    ]);
    */
    let inPoly = geolib.isPointInPolygon({ latitude: lat, longitude: lon }, [
      { latitude: bbox.lat1, longitude: bbox.lon1 },
      { latitude: bbox.lat2, longitude: bbox.lon1 },
      { latitude: bbox.lat2, longitude: bbox.lon2 },
      { latitude: bbox.lat1, longitude: bbox.lon2 },
    ]);
    
    if(inPoly) {
      console.log('inside poly')
      if(issue.lcs.closure.isCHINReportable == "true") {
        finalObstructions.push(issue);
      } else {
        console.log('not chin reportable')
      }
      console.log(issue.lcs.closure.isCHINReportable)
    } else {
      console.log('dropped outside poly')
    }
  })
  return finalObstructions;
}