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
//Date docs here...
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString

    const next = new Date("2020-02-17T00:00:00-08:00"); //offset 8 hours to UTC to get it to pacific
    const locales = 'en-US'

    //const next = new Date("2020-01-01T-8:00")
    const month_name = next.toLocaleDateString(locales, { month: 'long' })
    const month = parseInt(next.toLocaleDateString(locales, { month: 'numeric' }))
    const day_of_month = parseInt(next.toLocaleDateString(locales, { day: 'numeric' }))
    const day_of_week = next.toLocaleDateString(locales, { weekday: 'long' })
    const date = next.toLocaleDateString(locales, { dateStyle: 'full' })
    const time_zone = next.toLocaleDateString(locales, { timeZoneName: 'long' })
    const name = "Presidents' Day"

    context.res = {
        body: {
            date,
            name,
            day_of_week,
            month_name,month, 
            day_of_month,
            year:next.getUTCFullYear(),
            time_zone,
            date_iso:next.toISOString()
        },
        headers: {
            'Content-Type' : 'application/json'
        }
    }
    context.done()
    break
default:
    context.res = {
        status: 404,
        body: "Nothing to do"
    }
    context.done()
}

}
