const dataurl = "https://www.shelterlistings.org/city/"
const pagestartmarker = "Search listings by <a href=\""
const jsonstartmarker = /<script type="application\/ld\+json">/
const jsonendmarker = /<\/script>/

module.exports = async function (context, req) {
    const cityname = context.req.params.cityname

    if(!cityname)
        context.res = {
            status: 400,
            body: "Please pass a cityname on the path"
        }
    else {
        const response = await fetch(`${dataurl+cityname}-ca.html`)

        if (response.ok) {

            //looking for these markers...<script type="application/ld+json">
            const fullhtml = await response.text()
            const html = fullhtml.split(pagestartmarker,2)[1]


            const split = html
                .split(jsonstartmarker)
                .map(
                    (x,i)=>
                        i>0
                        ? JSONlogparse(
                            x
                            .split(jsonendmarker,1)[0]
                            .replace(/(\r|\n|\t)/gm,'')
                            )
                        : null
                    )

            context.res = 
                {
                    body: split,
                    headers: {
                        'Content-Type' : 'application/json'
                    }
                }
        } else {
            context.res = {
                status: 500,
                body: `Error getting data - ${response.text()}`
            }
        }
    }

    context.done()
}

function JSONlogparse(s) {
    var printError = function(error, explicit) {
        console.log(`[${explicit ? 'EXPLICIT' : 'INEXPLICIT'}] ${error.name}: ${error.message}`);
    }
    
    try {
        return JSON.parse(s, (key, value) => {
            console.log(`${key} - ${value}`); // log the current property name, the last is "".
            return value;     // return the unchanged property value.
          })
    } catch (e) {
        if (e instanceof SyntaxError) {
            printError(e, true);
        } else {
            printError(e, false);
        }
    }
}