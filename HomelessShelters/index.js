
const citiesurl = "https://www.shelterlistings.org/state/california.html"
const citiesmatchpat = /<a\s+href="https:\/\/www\.shelterlistings\.org\/city\/(\S+)-ca\.html"\s*>\s*([\w\s]+)\s*<\/a>/gm
const citiesmatch = citiesmatchpat.compile(citiesmatchpat)

const dataurl = "https://www.shelterlistings.org/city/"
const pagestartmarker = "Search listings by <a href=\""
const jsonstartmarker = /<script type="application\/ld\+json">/
const jsonendmarker = /<\/script>/
const linkpattern = /https:\/\/www.shelterlistings.org\/details\/\d+\//
const soft404page = "https://www.shelterlistings.org/nocity.html"

//usage http://localhost:7071/HomelessShelters/{cityname} --data for one city
//usage http://localhost:7071/HomelessShelters/{cityname}{?geocode=1}
//usage http://localhost:7071/HomelessShelters/ --list of cities

module.exports = async function (context, req) {
    const cityname = context.req.params.cityname

    if(!cityname) {
        //List all cities
        const response = await fetch(citiesurl)

        if (!response.ok)
            context.res = {
                status: response.status,
                body: `Error getting data - ${await response.text()}`
            }
        else {
            const html = await response.text()

            const results = []
            let onerow = []
            do {
                onerow = citiesmatch.exec(html)
                if (onerow) 
                    results.push(
                        {
                            //fullmatch : onerow[0],
                            code : onerow[1],
                            name : onerow[2],
                        }
                    )
            } while (onerow)

            context.res = {
                body: results
            }
        }
    } else {
        //Single city list
        const response = await fetch(`${dataurl+cityname}-ca.html`)

        if (!response.ok)
            context.res = {
                status: response.status,
                body: `Error getting data - ${await response.text()}`
            }
        else if(response.url.startsWith(soft404page))
            context.res = {
                status: 404,
                body: `Invalid city code - "${cityname}"`
            }
        else {
            //looking for these markers...<script type="application/ld+json">
            const html = (await response.text()).split(pagestartmarker,2)[1]

            if(!html) 
                context.res = {
                    status: 404,
                    body: `No city data for "${cityname}"`
                }
            else {
                let results = []

                for(let [i,value] of html.split(jsonstartmarker).entries())
                    if(i > 0) {
                        const jsonsplit = value.split(jsonendmarker,2)
                        const url = jsonsplit[1].match(linkpattern)[0]

                        const x = JSONlogparse(
                            jsonsplit[0]
                            .replace(/(\n|\r|\t)/g,'')
                            )
                        const jsonrow = {
                            "name" : x.name,
                            "address" : x.address.streetAddress,
                            "city" : x.address.addressLocality,
                            "state" : x.address.addressRegion,
                            "zipcode" : x.address.postalCode,
                            "phone" : x.telephone,
                            url,
                            "description" : x.description
                        }

                        if(req.query.geocode) {
                            const georesult = await geocode(`${jsonrow.address}, ${jsonrow.city}, ${jsonrow.state} ${jsonrow.zipcode}`)
                            if(georesult)
                                jsonrow['location'] = georesult
                        }

                        results.push(jsonrow)
                    }

                context.res = 
                    {
                        body: results,
                        headers: {
                            "Content-Type" : "application/json",
                            "Cache-Control" : "public, max-age=84600"
                        }
                    }
                }

        }

    }

    context.done()
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

function JSONlogparse(s) {
    const printError = function(error, explicit) {
        console.warn(`[${explicit ? 'EXPLICIT' : 'INEXPLICIT'}] ${error.name}: ${error.message}`);
    }
    
    try {
        return JSON.parse(s, (key, value) => {
            //console.log(`${key} - ${value}`); // log the current property name, the last is "".
            return value     // return the unchanged property value.
          })
    } catch (e) {
        printError(e, e instanceof SyntaxError);
    }
}