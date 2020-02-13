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
      body: JSON.stringify([]),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }
};