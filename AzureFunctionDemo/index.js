module.exports = function (context, req) {
    const icalUrl = 'https://calendar.google.com/calendar/ical/alpha.ca.gov_m9372uj21m6qdgrqg4olkdgo4c%40group.calendar.google.com/public/basic.ics';

    context.log('*****************************************************');
    context.log('JavaScript HTTP trigger function processed a request.');
    context.log('Query = ' + JSON.stringify(req.query));

    // if (req.query.name || (req.body && req.body.name)) {
    //     context.res = {
    //         // status: 200, /* Defaults to 200 */
    //         body: "V7 -   Hello NAME =  " + (req.query.name || req.body.name)
    //     };
    // }
    // else {
    //     context.res = {
    //         status: 400,
    //         body: "Please pass a name on the query string or in the request body"
    //     };
    // }


    var request = require('request');
    context.log('request start');
    request.get(icalUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            context.log('request complete');

            res = { isRaw: true, body: JSON.stringify(body)};
            context.res = res;
        } else {
            context.log('request PROBLEM')
        }
        context.log('*****************************************************');
        context.done();

    });
};
