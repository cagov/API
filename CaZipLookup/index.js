module.exports = async function (context, req) {
    const fs = require('fs');

    let input = context.req.params.zip;

    if (input) {
        let zips = JSON.parse(fs.readFileSync(context.executionContext.functionName + '/data.json','utf8'));
        
        var item;
        for (var i in zips) {
            item = zips[i][input];
            if (item) break;
        }

        if (item) {
            let cityout = [];
            item.forEach(cityname => cityout.push({"name":cityname}));

            context.res = {
                body: {"zip":input, "cities":cityout},
                headers: {
                    'Content-Type' : 'application/json'
                }
            };
        } else 
            context.res = {
                status: 404,
                body: "Zip not found - " + input
            };
    } else 
        context.res = {
            status: 400,
            body: "Please pass a zip on the path"
        };
};
