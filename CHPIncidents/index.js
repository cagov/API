const { BlobServiceClient } = require('@azure/storage-blob');
const parseXMLString = require('xml2js').parseString;
const geolib = require('geolib');
const streamToString = require('./stream-blob.js');

module.exports = async function (context, req) {
  const AZURE_STORAGE_CONNECTION_STRING = process.env["AZURE_STORAGE_CONNECTION_STRING"];
  const blobServiceClient = await BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerName = 'caltrans';
  const containerClient = await blobServiceClient.getContainerClient(containerName);
  let blobName = `chp-events.kml`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadBlockBlobResponse = await blockBlobClient.download(0).catch(error => console.log('there was an error with beging download'));
  if(downloadBlockBlobResponse) {
    let details = await streamToString(downloadBlockBlobResponse.readableStreamBody).catch(error => console.log('there was an error with end download'));

    let resultSet = [];
    let bbox = {};
    bbox.lat1 = req.query.lat1;
    bbox.lon1 = req.query.lon1;
    bbox.lat2 = req.query.lat2;
    bbox.lon2 = req.query.lon2;
  
    if(!req.query.lat1 || !req.query.lat2 || !req.query.lon1 || !req.query.lon2) {
      context.res = {
        body: 'no bounding box supplied',
        headers: {
          'Content-Type': 'application/json'
        }
      }  
    }
  
    parseXMLString(details, function (err, result) {
      if(result.kml.Document[0].Placemark) {
        result.kml.Document[0].Placemark.forEach( (incident) => {
          console.log(incident.Point[0].coordinates[0])
          let coords = incident.Point[0].coordinates[0].split(',');  
          console.log(coords);
          let lon = parseFloat(coords[0]);
          let lat = parseFloat(coords[1]);
          let inPoly = geolib.isPointInPolygon({ latitude: lat, longitude: lon }, [
            { latitude: bbox.lat1, longitude: bbox.lon1 },
            { latitude: bbox.lat2, longitude: bbox.lon1 },
            { latitude: bbox.lat2, longitude: bbox.lon2 },
            { latitude: bbox.lat1, longitude: bbox.lon2 },
          ]);
          if(inPoly) {
            let resultObj = {};
            resultObj.lat = lat;
            resultObj.lon = lon;
            resultObj.description = incident.description[0];
            resultObj.name = incident.name[0];
            resultSet.push(resultObj);
          }
        })
      }
  
      context.res = {
        body: JSON.stringify(resultSet),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    });      
  } else {
    context.res = {
      body: "file find fail",
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }
};