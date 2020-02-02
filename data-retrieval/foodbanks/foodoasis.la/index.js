const csvtojsonV2=require("csvtojson");
const fs = require('fs');

let jsonData = JSON.parse(fs.readFileSync('./foods.json','utf8'));
let matchCount = 0;
let brandNewItems = [];

csvtojsonV2()
.fromFile('./food-pantry.csv')
.then((csvObj) => {
  csvObj.forEach( (item) => {
    jsonData.features.forEach( (jsonItem) => {
      let cleanedPhone = item.phone.replace('(','').replace(')','.').replace('-','.');
      // console.log(cleanedPhone)
      if(item.name == jsonItem.properties.title || cleanedPhone == jsonItem.properties.phone) {
        // console.log('MATCH on: '+item.name+' - '+item.city+':'+jsonItem.properties.address2);
        matchCount++;
        jsonItem.properties.matched = true;
      }
    })
  })
  jsonData.features.forEach( (jsonItem) => {
    if(!jsonItem.properties.matched) {
      brandNewItems.push(jsonItem);
    }
  })
  console.log('number of matches: '+matchCount);
  console.log('original json length: '+jsonData.features.length)
  console.log('csv length: '+csvObj.length)
  console.log('items to add to csv: '+brandNewItems.length);

  // prepare new items
  // name,address_1,address_2,city,state,zip,phone,latitude,longitude,category,website,,daycode1,day1_open,day1_close,daycode2,day2_open,day2_close,daycode3,day3_open,day3_close,daycode4,day4_open,day4_close,daycode5,day5_open,day5_close,daycode6,day6_open,day6_open,daycode7,day7_open,day7_close
  outputString = '';
  brandNewItems.forEach( (item) => {
    outputString += `${item.properties.title},${item.properties.address},`;
    if(item.properties.address2 && item.properties.address2.indexOf(', CA') > -1) {
      outputString += `,${item.properties.address2.split(', CA')[0]},CA,${item.properties.address2.split(', CA')[1].replace('-','').trim()},`
    } else {
      if(item.properties.address2) {
        outputString += `,${item.properties.address2},CA,,`
      }
    }
    if(item.properties.phone) {
      outputString += `${item.properties.phone},`;
    } else {
      outputString += ',';
    }
    outputString += `${item.geometry.coordinates[1]},${item.geometry.coordinates[0]},,`;
    if(item.properties.website) {
      outputString += `${item.properties.website},`
    } else {
      outputString += `,`
    }
    outputString += ',,,,,,,,,,,,,,,,,,,,,,\n';
  })
  console.log(outputString)
})