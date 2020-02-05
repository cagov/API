const csv=require('csvtojson')
const fs = require('fs')

let currentjson = JSON.parse(fs.readFileSync('./all-water-systems-list.json'));

const csvFilePath='./system-ear-data.csv'
csv()
.fromFile(csvFilePath)
.then((jsonObj)=>{
  
  jsonObj.forEach( (system) => {
    currentjson.forEach( (item) => {
      if(item["Water System No"] == system.PWSID) {
        let metaObj = {};
        
        if(system['Website URL']) {
          metaObj.website = system['Website URL'];
        }
        if(item['Water System Ownership']) {
          metaObj.ownership = system['Water System Ownership'];
        }
        item.meta = metaObj;

        if(system['Website URL']) {
          console.log(item)
        }
      }
    })
  })

  fs.writeFileSync('./all-water-systems-list2.json',JSON.stringify(currentjson),'utf8');

})