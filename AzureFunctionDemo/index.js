module.exports = function (context, req) {
    const icalUrl = 'https://calendar.google.com/calendar/ical/alpha.ca.gov_m9372uj21m6qdgrqg4olkdgo4c%40group.calendar.google.com/public/basic.ics';

    context.log('*****************************************************');
    context.log('JavaScript HTTP trigger function processed a request.');
    context.log('Query = ' + JSON.stringify(req.query));

    const https = require("https");
    https.get(icalUrl, response => {
  
        var body = '';
        var i = 0;
        response.on('data', function (chunk) {
            i++;
            body += chunk;
            console.log('BODY Part: ' + i);
        });
        response.on('end', function () {
    
            res = { 
                isRaw: 'true', 
                body: body,
                headers: {
                    'Content-Disposition' : 'attachment; filename="California State Holidays.ics"',
                    'Content-Type' : 'text/calendar'
                }
            };
            context.res = res;

            console.log('Finished');
            context.done();
        });


      });
};
