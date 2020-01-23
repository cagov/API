const geolib = require('geolib');
const { BlobServiceClient } = require('@azure/storage-blob');
const uuidv1 = require('uuid/v1');

module.exports = async function (context, req) {
  const routeName = context.req.params.route;

  let AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

  // Create the BlobServiceClient object which will be used to create a container client
  const blobServiceClient = await BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

  // Create a unique name for the container
  const containerName = 'caltrans';

  // Get a reference to a container
  const containerClient = await blobServiceClient.getContainerClient(containerName);

  // Get a block blob client
  console.log(`${routeName}.json`)
  let blobName = `${routeName}.json`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // download data
  console.log('going to download')
  const downloadBlockBlobResponse = await blockBlobClient.download(0).catch(error => console.log('there was an error with beging download'));

  if (downloadBlockBlobResponse) {
    console.log('getting stream')
    let routeDetails = await streamToString(downloadBlockBlobResponse.readableStreamBody).catch(error => console.log('there was an error with end download'));
    // get lats and lons
    let bbox = {};
    bbox.lat1 = req.query.lat1;
    bbox.lon1 = req.query.lon1;
    bbox.lat2 = req.query.lat2;
    bbox.lon2 = req.query.lon2;
    let direction = req.query.direction;

    // fix connection string
    console.log(routeDetails)
    console.log('body is')
    let returnBody = { "route": parseLCS(JSON.parse(routeDetails), direction, bbox) };
    console.log(returnBody)
    context.res = {
      body: returnBody,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  } else {
    console.log('could not find blob')
    context.res = {
      status: 400,
      body: `Could not find route info for ${routeName}. Please pass a valid route on the path`
    };
  }
};

// A helper function used to read a Node.js readable stream into a string
async function streamToString(readableStream) {
  console.log('hello')
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      console.log('has chunk')
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      console.log('and ended')
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}

function parseLCS(lcs, direction, bbox) {
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