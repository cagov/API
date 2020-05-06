const fs = require('fs');
const request = require('request');
const csv=require('csvtojson');

let outputObj = {};
outputObj.telehealthList = [];
request({ 
    uri: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQWhNGTFQp52frHM68ZXJfnthkw4Q7m9oL219eA00fq8yS9wtxSbK2-eYeVKxJTu09wtp7T9iqOj5E0/pub?gid=173807658&single=true&output=csv&extra=' + new Date().getTime().toString()
  }, function (error, response, body) {
    csv({})
    .fromString(body)
    .then((csvRow)=>{ 
      csvRow.forEach((row, i) => {
        outputObj.telehealthList.push(row)
      })
      fs.writeFileSync('./telehealth.json',JSON.stringify(outputObj),'utf8');
    })
  })

// This is where you go to edit the source of that published url above: https://docs.google.com/spreadsheets/d/10FMVrPXAHOOEoG2CSKOK7CssOepOjRLuU31l3XmYw2E/edit#gid=173807658