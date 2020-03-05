//usage 
//AlphaGeoTypeahead?onlyca=false&q=84116

module.exports = async function (context, req) {
    const query = req.query.q
    const onlyca = (req.query.onlyca || "true").toLowerCase() === "true"
    //const radius = Number(req.query.r) || 10

    if (query) {
        let results = await geocodereadahead(query,onlyca)

        if (!results||results.length===0)
            results = await geocodereadahead(query+', California, United States',onlyca)
        

        if(results)
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: {match: results},
                headers: {
                    'Content-Type' : 'application/json',
                    "Cache-Control" : "public, max-age=84600" //1 day
                }
            }
        else 
            context.res = {
                status: 404,
                body: "No result for query - "+query
            }
    }
    else 
        context.res = {
            status: 400,
            body: "Please pass a q=(query) on the query string"
        }
}


async function geocodereadahead(query,onlyca) {
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

    const geolink = `https://atlas.microsoft.com/search/address/json?subscription-key=${apikey}&typeahead=true&api-version=1.0&limit=10&countrySet=US&extendedPostalCodesFor=None&lat=38.576&lon=-121.493&radius=1000000&query=`
// Getcoder docs - https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchaddress

    const georesponse =  await fetch(geolink+encodeURIComponent(query))
    if (georesponse.ok) {
        const geojson = await georesponse.json()

        return geojson.results
            .filter(x=>!onlyca||x.address.countrySubdivision==="CA")
            .map(x=>({address:x.address.freeformAddress}))
    }
}