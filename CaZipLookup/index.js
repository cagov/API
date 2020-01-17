module.exports = async function (context, req) {
    const fs = require('fs');

//Leave this as is for a template to use for new services


        if (context.req.params.zip) {
            //let rawdata = fs.readFileSync(context.executionContext.functionName + '/data.json');
            let zips = JSON.parse(fs.readFileSync(context.executionContext.functionName + '/data.json','utf8'));
            
            let out = [];
            zips.forEach( (item) => {
                for(var key in item) {
                    if(key == context.req.params.zip) {
                        let cities = item[key];
                        let cityout = [];

                        for(var key2 in cities) {
                            cityout.push({"name":cities[key2]});
                        }



                    //out.push({"zip":parseInt(context.req.params.zip,10), "city":item[key]});
                    out.push({"zip":context.req.params.zip, "cities":cityout});
                        //out = item[key];
                    }
                }
              });
            



              
            context.res = {
                



                // status: 200, /* Defaults to 200 */
                body: out
            };
        }
        else {
            context.res = {
                status: 400,
                body: "Please pass a zip on the path"
            };
        }
};
