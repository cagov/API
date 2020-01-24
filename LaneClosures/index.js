const { BlobServiceClient } = require('@azure/storage-blob');
const uuidv1 = require('uuid/v1');
const streamToString = require('./stream-blob.js');
const parseLCS = require('./parse-lanedata.js');

module.exports = async function (context, req) {
  const AZURE_STORAGE_CONNECTION_STRING = process.env["AZURE_STORAGE_CONNECTION_STRING"];
  
  const routeName = context.req.params.route;
  const blobServiceClient = await BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerName = 'caltrans';
  const containerClient = await blobServiceClient.getContainerClient(containerName);
  let blobName = `${routeName}.json`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadBlockBlobResponse = await blockBlobClient.download(0).catch(error => console.log('there was an error with beging download'));

  if (downloadBlockBlobResponse) {
    let routeDetails = await streamToString(downloadBlockBlobResponse.readableStreamBody).catch(error => console.log('there was an error with end download'));
    let bbox = {};
    bbox.lat1 = req.query.lat1;
    bbox.lon1 = req.query.lon1;
    bbox.lat2 = req.query.lat2;
    bbox.lon2 = req.query.lon2;
    let direction = req.query.direction;

    let returnBody = { "route": parseLCS(JSON.parse(routeDetails), direction, bbox) };
    context.res = {
      body: returnBody,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  } else {
    context.res = {
      status: 400,
      body: `Could not find route info for ${routeName}. Please pass a valid route on the path`
    };
  }
};