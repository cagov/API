//use this https://www.npmjs.com/package/geolib
const geolib = require('geolib')
const fs = require('fs')
const data = JSON.parse(fs.readFileSync('HomelessSheltersNew/Shelters.json','utf8')).filter(x=>x.location)

module.exports = async function (context, req) {
    const query = req.query.q
    //const radius = Number(req.query.r) || 10

    if (query) {
        const point = await geocode(query)

        const coords = data
            .map((x,i) => {
                return {
                    i,
                    latitude:x.location.lat,
                    longitude:x.location.lon 
                }
            })
        
        const results = geolib
            .orderByDistance(point, coords)
            .slice(0,10)
            .map(x=>data[x.i])

        results.forEach(x=> 
            x.location["distance"] =
                round(
                    geolib.convertDistance(
                        geolib.getDistance(
                            {
                                latitude:x.location.lat,
                                longitude:x.location.lon
                            }
                        , point)
                    ,'mi')
                ,2)
        )

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: results,
            headers: {
                'Content-Type' : 'application/json',
                "Cache-Control" : "public, max-age=84600" //1 day
            }
        }
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a q=(query) on the query string"
        };
    }
}


async function geocode(query) {
    /*
    The following local.settings.json file is required for this to work...
    
    {
        ...
        "Values": {
            ...
            "FUNCTIONS_MAP_KEY": "(Insert "Azure Authentication Shared Key" here )"
        }
    }
    */
    
    const apikey = process.env["FUNCTIONS_MAP_KEY"]

    if(!apikey)
        throw Error("Api key (FUNCTIONS_MAP_KEY) is missing from configuration.  See source comment for help.")

    const geolink = `https://atlas.microsoft.com/search/address/json?subscription-key=${apikey}&api-version=1.0&limit=1&countrySet=US&extendedPostalCodesFor=None&query=`
// Getcoder docs - https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchaddress

    const georesponse =  await fetch(geolink+encodeURIComponent(query))
    if (georesponse.ok) {
        const geojson = await georesponse.json()
        const georesult =  geojson.summary.numResults>0 ? geojson.results[0].position : null
        if(georesult)
            return {latitude: georesult.lat, longitude:georesult.lon}
    }
}

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals)
  }