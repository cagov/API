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


//        var results = zips.filter( x =>
//            Object.keys(x)[0]==input 
//        );

//        if(results.length==1) {
            let out = [];
//            var item = results[0];

        // zips.forEach(item => {
                var zip = Object.keys(item)[0];
            // if(zip === input) {
                    let cityout = [];

                    item[zip].forEach(cityname => cityout.push({"name":cityname}));

                    out.push({"zip":zip, "cities":cityout});
            //   }
        //  });
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
