const { BlobServiceClient } = require('@azure/storage-blob');
const streamToString = require('./stream-blob.js');
const analytes = require('./analytes.json')

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

    let measuredAnalytes = new Map();
    analytes.forEach( (analyte) => {
      measuredAnalytes.set(analyte.key,analyte);
    })

    let cleanData = [];
    JSON.parse(details).forEach( (reading) => {
      if(measuredAnalytes.get(reading.ANALYTE_NAME) && !reading.MCL_VALUE) {
        // do not return becuase this may be a system that is no longer in violation like CA1910020
      } else {
        cleanData.push(reading)
      }
    })
    context.res = {
      body: JSON.stringify(cleanData),
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