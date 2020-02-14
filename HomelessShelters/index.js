const dataurl = "https://www.shelterlistings.org/city/"
const pagestartmarker = "Search listings by <a href=\""
const jsonstartmarker = /<script type="application\/ld\+json">/
const jsonendmarker = /<\/script>/
const soft404page = "https://www.shelterlistings.org/nocity.html"

module.exports = async function (context, req) {
    const cityname = context.req.params.cityname

    if(!cityname)
        context.res = {
            status: 400,
            body: "Please pass a cityname on the path"
        }
    else {
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
            const fullhtml = await response.text()
            const html = fullhtml.split(pagestartmarker,2)[1]

            const jsondataset = html
                .split(jsonstartmarker)
                .map(
                    (value,i)=>
                        i === 0
                        ? null
                        : JSONlogparse(
                            value
                            .split(jsonendmarker,1)[0]
                            .replace(/(\n|\r|\t)/g,'')
                            )
                    )

            context.res = 
                {
                    body: jsondataset,
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