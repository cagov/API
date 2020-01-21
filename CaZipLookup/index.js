module.exports = async function (context, req) {
    const fs = require('fs');

    let input = context.req.params.zip;

    if (input) {
        let zips = JSON.parse(fs.readFileSync(context.executionContext.functionName + '/data.json','utf8'));
        
        var item;
        for (var i in zips) {
            var row = zips[i];
            if (Object.keys(row)[0]==input) {
                item = row;
                break;
            }
        }

        
        if (item) {
            let out = [];
            let cityout = [];
            item[input].forEach(cityname => cityout.push({"name":cityname}));
            out.push({"zip":input, "cities":cityout});

            context.res = {
                body: out,
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
