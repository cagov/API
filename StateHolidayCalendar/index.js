module.exports = function (context, req) {
    const icalUrl = 'https://calendar.google.com/calendar/ical/alpha.ca.gov_m9372uj21m6qdgrqg4olkdgo4c%40group.calendar.google.com/public/basic.ics'

    //context.log('*****************************************************');
    //context.log('JavaScript HTTP trigger function processed a request.');
    //context.log('Query = ' + JSON.stringify(req.query));

switch ((context.req.params.route || "").toLowerCase()) {
case '.ics':
    const https = require('https')
    https.get(icalUrl, response => {

        var body = ''
        var i = 0
        response.on('data', function (chunk) {
            i++;
            body += chunk;
        })
        response.on('end', function () {
            res = { 
                isRaw: 'true', 
                body: body,
                headers: {
                    'Content-Disposition' : 'attachment; filename="California State Holidays.ics"',
                    'Content-Type' : 'text/calendar'
                }
            }
            context.res = res

            //console.log('Finished')
            context.done()
        })
    })
    break
case 'next':
    context.res = {
        body: {day_of_week:"Monday",month_name:"February",month:2, day_of_month:17, year:2020, name:"Presidents' Day", date:"2020-02-17T00:00:00.000Z"},
        headers: {
            'Content-Type' : 'application/json'
        }
    };
    context.done()
    break
default:
    context.res.body = 'nevermind'
    context.done()
}

}
