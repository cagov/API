module.exports = async function (context, req) {
    context.log('*****************************************************');
    context.log('JavaScript HTTP trigger function processed a request.');
    context.log('Query = ' + JSON.stringify(req.query));

    if (req.query.name || (req.body && req.body.name)) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "V7 -   Hello NAME =  " + (req.query.name || req.body.name)
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }

    context.log('*****************************************************');
    context.done();
};
