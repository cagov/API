const csv=require('csvtojson')
const fs = require('fs')

const csvFilePath='./all-water-systems-list.csv'
csv()
.fromFile(csvFilePath)
.then((jsonObj)=>{
  // console.log(jsonObj);
  fs.writeFileSync('./all-water-systems-list.json',JSON.stringify(jsonObj),'utf8');
  
  jsonObj.forEach( (system) => {
    if(system['Water System No'] == 'CA0110005') {
      console.log(system)
    }
  })
  // CA0110005

  /**
   * [
   * 	{a:"1", b:"2", c:"3"},
   * 	{a:"4", b:"5". c:"6"}
   * ]
   */ 
})