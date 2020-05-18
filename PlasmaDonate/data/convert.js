'use strict';

const fs = require('fs')
const excelToJson = require('convert-excel-to-json');
 
const result = excelToJson({
  source: fs.readFileSync('./PlasmaCenterDatabase_CCP_5.17.20.xlsx'),
  header:{
      rows: 1
  },
  columnToKey: {
    A: 'County',
    B: 'Name',
    C: 'Address1',
    D: 'Address2',
    E: 'CityStateZip',
    F: 'Contact',
    G: 'Website'
  },

});

fs.writeFile('./plasmalocs.json', JSON.stringify(result["Dynamic Data"]), 'utf8', function() {
  console.log('done')
})

/*
[{"County":"Contra Costa","California Plasma Center/Blood Center and Affiliation":"American Red Cross - Contra Costa Donation Center","Address Line 1":"140 Gregory Lane","City, State, Zip Code":"Pleasant Hill, CA 94523","Contact Information":"1-800-733-2767","Website":"https://www.redcrossblood.org/donate-blood/dlp/plasma-donations-from-recovered-covid-19-patients.html"}
...
*/