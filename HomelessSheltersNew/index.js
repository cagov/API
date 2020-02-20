module.exports = async function (context, req) {
    const query = req.query.q
    const radius = Number(req.query.r) || 10

    if (query) {
        const georesult = await geocode(query)

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: `q=${query}, r=${radius}, result=${JSON.stringify(georesult)}`
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
            return {"lat": georesult.lat, "lon":georesult.lon}
    }
}