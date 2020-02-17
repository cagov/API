
const citiesurl = "https://www.shelterlistings.org/state/california.html"
const citiesmatchpat = /<a\s+href="https:\/\/www\.shelterlistings\.org\/city\/(\S+)-ca\.html"\s*>\s*([\w\s]+)\s*<\/a>/gm
const citiesmatch = citiesmatchpat.compile(citiesmatchpat)

const dataurl = "https://www.shelterlistings.org/city/"
const pagestartmarker = "Search listings by <a href=\""
const jsonstartmarker = /<script type="application\/ld\+json">/
const jsonendmarker = /<\/script>/
const linkpattern = /https:\/\/www.shelterlistings.org\/details\/\d+\//
const soft404page = "https://www.shelterlistings.org/nocity.html"

module.exports = async function (context, req) {
    const cityname = context.req.params.cityname

    if(!cityname) {
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
            } while (onerow);

            context.res = {
                body: results
            }
        }
    } else {
        const response = await fetch(`${dataurl+cityname}-ca.html`)

        if (!response.ok)
            context.res = {
                status: response.status,
                body: `Error getting data - ${await response.text()}`
            }
        else if(response.url.startsWith(soft404page))
            context.res = {
                status: 404,
                body: `No city data for "${cityname}"`
            }
        else {
            //looking for these markers...<script type="application/ld+json">
            const html = (await response.text()).split(pagestartmarker,2)[1]

            let results = []

            html
                .split(jsonstartmarker)
                .forEach((value,i) => {
                    if(i > 0) {
                        const jsonsplit = value.split(jsonendmarker,2)
                        const url = jsonsplit[1].match(linkpattern)[0]

                        let x = JSONlogparse(
                            jsonsplit[0]
                            .replace(/(\n|\r|\t)/g,'')
                            )

                        results.push({
                                "name" : x.name,
                                "address" : x.address.streetAddress,
                                "city" : x.address.addressLocality,
                                "state" : x.address.addressRegion,
                                "zipcode" : x.address.postalCode,
                                "phone" : x.telephone,
                                url,
                                "description" : x.description
                            })
                    }
                })

            context.res = 
                {
                    body: results,
                    headers: {
                        'Content-Type' : 'application/json'
                    }
                }
        }

    }

    context.done()
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