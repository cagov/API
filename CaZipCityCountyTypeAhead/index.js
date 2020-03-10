//usage 
//CaZipCityCountyTypeAhead?citymode=true&countymode=false&q=84116
const fs = require('fs');
const counties = getCounties().map(x=>x.name).sort();
const zips = JSON.parse(fs.readFileSync('CaZipCityCountyTypeAhead/unique-zips-slim.json','utf8'));
const cities = JSON.parse(fs.readFileSync('CaZipCityCountyTypeAhead/just-cities.json','utf8'));
const maxrows = 10;

module.exports = async function (context, req) {
    let query = req.query.q
    const citymode = (req.query.citymode || "true").toLowerCase() === "true"
    const countymode = (req.query.countymode || "true").toLowerCase() === "true"

    if (query) {
        query = query.toLowerCase();

        let results = zips
            .filter(x=>x.includes(query));

        if(citymode) {
            results = results.concat(
                cities.filter(x=>x.toLowerCase().includes(query))
            );
        }
        
        if(countymode) {
            results = results.concat(
                counties.filter(x=>x.toLowerCase().includes(query))
            );
        }
        
        results = results
            .sort(
                (x,y) => 
                    x.toLowerCase().startsWith(query) === y.toLowerCase().startsWith(query)
                    ? x.localeCompare(y)
                    : x.toLowerCase().startsWith(query) 
                        ? -1 
                        : 1
                    )
            .slice(0,maxrows);

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: {match: results},
            headers: {
                'Content-Type' : 'application/json',
                "Cache-Control" : "public, max-age=84600" //1 day
            }
        }
    }
    else 
        context.res = {
            status: 400,
            body: "Please pass a q=(query) on the query string"
        }
}

function getCounties() {
    return [
        {
        name: 'Modoc'
        },
        {
        name: 'Siskiyou'
        },
        {
        name: 'Del Norte'
        },
        {
        name: 'Humboldt'
        },
        {
        name: 'Trinity'
        },
        {
        name: 'Shasta'
        },
        {
        name: 'Lassen'
        },
        {
        name: 'Mendocino'
        },
        {
        name: 'Tehama'
        },
        {
        name: 'Plumas'
        },
        {
        name: 'Lake'
        },
        {
        name: 'Colusa'
        },
        {
        name: 'Glenn'
        },
        {
        name: 'Butte'
        },
        {
        name: 'Yuba'
        },
        {
        name: 'Sierra'
        },
        {
        name: 'Nevada'
        },
        {
        name: 'Alameda'
        },
        {
        name: 'Alpine'
        },
        {
        name: 'Amador'
        },
        {
        name: 'Contra Costa'
        },
        {
        name: 'Fresno'
        },
        {
        name: 'Los Angeles'
        },
        {
        name: 'Merced'
        },
        {
        name: 'San Mateo'
        },
        {
        name: 'Santa Clara'
        },
        {
        name: 'Mono'
        },
        {
        name: 'Napa'
        },
        {
        name: 'Orange'
        },
        {
        name: 'San Benito'
        },
        {
        name: 'San Diego'
        },
        {
        name: 'San Luis Obispo'
        },
        {
        name: 'Santa Barbara'
        },
        {
        name: 'Sonoma'
        },
        {
        name: 'Sutter'
        },
        {
        name: 'Tulare'
        },
        {
        name: 'Yolo'
        },
        {
        name: 'Madera'
        },
        {
        name: 'Calaveras'
        },
        {
        name: 'Mariposa'
        },
        {
        name: 'Solano'
        },
        {
        name: 'Inyo'
        },
        {
        name: 'Monterey'
        },
        {
        name: 'Stanislaus'
        },
        {
        name: 'Marin'
        },
        {
        name: 'San Joaquin'
        },
        {
        name: 'Kings'
        },
        {
        name: 'San Francisco'
        },
        {
        name: 'Imperial'
        },
        {
        name: 'Placer'
        },
        {
        name: 'Tuolumne'
        },
        {
        name: 'Ventura'
        },
        {
        name: 'Santa Cruz'
        },
        {
        name: 'Kern'
        },
        {
        name: 'San Bernardino'
        },
        {
        name: 'El Dorado'
        },
        {
        name: 'Sacramento'
        },
        {
        name: 'Riverside'
        }
    ];
}