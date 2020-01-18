module.exports = async function (context, req) {
    const fs = require('fs');

    let input = context.req.params.zip;

    if (input) {
        let zips = JSON.parse(fs.readFileSync(context.executionContext.functionName + '/data.json','utf8'));
        let out = [];
        zips.forEach(item => {
            var zip = Object.keys(item)[0];
            if(zip === input) {
                let cities = item[zip];
                let cityout = [];

                for(var key2 in cities)
                    cityout.push({"name":cities[key2]});

                out.push({"zip":zip, "cities":cityout});
            }
            });
        
        if(out.length==0) 
            context.res = {
                // status: 200, /* Defaults to 200 */
                status: 404,
                body: "Zip not found - " + input
            };
        else
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: out,
                headers: {
                    'Content-Type' : 'application/json'
                }
            };
    }
    else 
        context.res = {
            status: 400,
            body: "Please pass a zip on the path"
        };
};
