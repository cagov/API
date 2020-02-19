const fs = require('fs');
const zips = JSON.parse(fs.readFileSync('CaZipLookup/data.json','utf8'));

module.exports = async function (context, req) {
    const input = context.req.params.zip;

    if (input) {
        let cities = [];
        for (const ziprow of zips) {
            cities = ziprow[input];
            if (cities) break;
        }

        if (cities) 
            context.res = {
                body: {"zip":input, "cities":cities.map(cityname => ({"name" : cityname} ))},
                headers: {
                    'Content-Type' : 'application/json',
                    "Cache-Control" : "public, max-age=84600" //1 day
                }
            };
        else 
            context.res = {
                status: 404,
                body: "Zip not found - " + input
            };
    } else 
        context.res = {
            status: 400,
            body: "Please pass a zip on the path"
        };
};