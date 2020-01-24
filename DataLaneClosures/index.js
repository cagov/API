const { BlobServiceClient } = require('@azure/storage-blob');
const fetch = require('node-fetch');

module.exports = async function (context, myTimer) {
  const AZURE_STORAGE_CONNECTION_STRING = process.env["AZURE_STORAGE_CONNECTION_STRING"];
  const blobServiceClient = await BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerName = 'caltrans';
  const containerClient = await blobServiceClient.getContainerClient(containerName);

  let roadMap = new Map();

  logInfo = await getData('http://cwwp2.dot.ca.gov/data/d3/lcs/lcsStatusD03.json');
  logInfo = await getData('http://cwwp2.dot.ca.gov/data/d1/lcs/lcsStatusD01.json');
  logInfo = await getData('http://cwwp2.dot.ca.gov/data/d2/lcs/lcsStatusD02.json');
  logInfo = await getData('http://cwwp2.dot.ca.gov/data/d4/lcs/lcsStatusD04.json');
  logInfo = await getData('http://cwwp2.dot.ca.gov/data/d5/lcs/lcsStatusD05.json');
  logInfo = await getData('http://cwwp2.dot.ca.gov/data/d6/lcs/lcsStatusD06.json');
  logInfo = await getData('http://cwwp2.dot.ca.gov/data/d7/lcs/lcsStatusD07.json');
  logInfo = await getData('http://cwwp2.dot.ca.gov/data/d8/lcs/lcsStatusD08.json');
  logInfo = await getData('http://cwwp2.dot.ca.gov/data/d9/lcs/lcsStatusD09.json');
  logInfo = await getData('http://cwwp2.dot.ca.gov/data/d10/lcs/lcsStatusD10.json');
  logInfo = await getData('http://cwwp2.dot.ca.gov/data/d11/lcs/lcsStatusD11.json');
  logInfo = await getData('http://cwwp2.dot.ca.gov/data/d12/lcs/lcsStatusD12.json');

  roadMap.forEach( async (value, key, map) => {
    let fileData = [];
    let incidents = roadMap.get(key);
    incidents.forEach( (inc) => {
      fileData.push(inc)
    })
  
    let blobName = `${key}.json`;
    let blockBlobClient = containerClient.getBlockBlobClient(blobName);
    let data = JSON.stringify(fileData);
    let uploadBlobResponse = await blockBlobClient.upload(data, data.length);
    console.log("Blob was uploaded successfully. requestId: ", uploadBlobResponse.requestId);

  })

  async function getData(url) {
    const response = await fetch(url);
    const json = await response.json();
    json.data.forEach( (item) => {
      let routeName = item.lcs.location.begin.beginRoute;
      if(roadMap.get(routeName)) {
        let conditionsSoFar = roadMap.get(routeName);
        conditionsSoFar.push(item);
        roadMap.set(routeName,conditionsSoFar);
      } else {
        roadMap.set(routeName,[item]);
      }
    })
    return('parsed '+url)
  }
};


