module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.query.name || (req.body && req.body.name)) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "Hello " + (req.query.name || req.body.name)
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
};




const { BlobServiceClient } = require('@azure/storage-blob');
const streamToString = require('./stream-blob.js');

module.exports = async function (context, req) {
  const AZURE_STORAGE_CONNECTION_STRING = process.env["AZURE_STORAGE_CONNECTION_STRING"];
  const blobServiceClient = await BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerName = 'water-systems';
  const containerClient = await blobServiceClient.getContainerClient(containerName);
  let blobName = `${req.query.systemId}.json`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadBlockBlobResponse = await blockBlobClient.download(0).catch(error => console.log('there was an error with beging download'));
  if(downloadBlockBlobResponse) {
    let details = await streamToString(downloadBlockBlobResponse.readableStreamBody).catch(error => console.log('there was an error with end download'));

    context.res = {
      body: details,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  } else {
    context.res = {
      body: "file find fail",
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }
};