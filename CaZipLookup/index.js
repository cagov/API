module.exports = async function (context, req) {
    const fs = require('fs');

    let input = context.req.params.zip;

    if (input) {
        let zips = JSON.parse(fs.readFileSync(context.executionContext.functionName + '/data.json','utf8'));
        let out = [];
        zips.forEach(item => {
            var zip = Object.keys(item)[0];
            if(zip === input) {
                let cityout = [];

                item[zip].forEach(cityname => cityout.push({"name":cityname}));

                out.push({"zip":zip, "cities":cityout});
            }
        });
        
        if(out.length==0) 
            context.res = {
                status: 404,
                body: "Zip not found - " + input
            };
        else
            context.res = {
                body: out,
                headers: {
                    'Content-Type' : 'application/json'
                }
            };
    } else 
        context.res = {
            status: 400,
            body: "Please pass a zip on the path"
        };
};
