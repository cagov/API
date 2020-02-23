const csv=require('csvtojson')
const fs = require('fs')

csv()
.fromFile('./analytes.csv')
.then((jsonObj)=>{
  console.log(jsonObj);
  fs.writeFileSync('../analytes.json',JSON.stringify(jsonObj),'utf8')
})
