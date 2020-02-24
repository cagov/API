var data = []

module.exports = async function (context, req) {
   
//Leave this as is for a template to use for new services

const now = new Date().toLocaleString('en-US', {
    //timeZoneName: 'short'

    timeZone: "America/Los_Angeles"
    //timeZone: 'Pacific Standard Time'
  });

data.push({"date":now, "ip":req.headers['x-forwarded-for']})

        context.res = {
            body: "Connection Success! - \n\n" + JSON.stringify(data,null, '  ')
        };

};
