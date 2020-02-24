var data = []

module.exports = async function (context, req) {
   
//Leave this as is for a template to use for new services

const now = new Date()

data.push({"date":now.toLocaleTimeString(), "ip":req.headers['x-forwarded-for']})

        context.res = {
            body: "Connection Success! - " + JSON.stringify(data)
        };

};
