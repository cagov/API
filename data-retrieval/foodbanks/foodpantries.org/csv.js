// read all the file sin ./banks
// put them in csv format
let fs = require('fs')
let fetch = require('node-fetch');

let directoryContents = require('readdir').readSync('./banks/');
console.log(directoryContents)

let outputString = '';

directoryContents.forEach( async function(file, index) {

  if(index < 99) {
    let json = JSON.parse(fs.readFileSync('./banks/'+file,'utf8'))
    
    let place = `${json.address.streetAddress} ${json.address.addressLocality}, ${json.address.addressRegion} ${json.address.postalCode}`;
    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json?access_token=pk.eyJ1IjoiYWxwaGEtY2EtZ292IiwiYSI6ImNrNTZ5em1qMDA4ZWkzbG1yMDg4OXJyaDIifQ.GleKGsZsaOcmxfsYUR9bTg`
    const response = await fetch(url);
    const respJson = await response.json();

    let coordinates;
    if(respJson.features[0].center) {
      coordinates = respJson.features[0].center;
    }
    if(respJson.features.geometry) {
      coordinates = respJson.features.geometry.coordinates;
    }
    if(coordinates) {
      outputString += `${json.name},${json.address.streetAddress},,${json.address.addressLocality},${json.address.addressRegion},${json.address.postalCode},`;
      if(json.phone) {
        outputString += `${json.phone},`;
      } else {
        outputString += `,`;
      }
      outputString += `${coordinates[1]},${coordinates[0]},,,,,,,,,,,,,,,,,,,,,,,,\n`  
    }
  }
  console.log('\n\n\n'+outputString)  
})


