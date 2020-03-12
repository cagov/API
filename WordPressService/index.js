var pingdata = []

module.exports = async function (context, req) {
    //ontext.log('JavaScript HTTP trigger function processed a request.');

    const ping = req.query.ping
    const pingcheck = req.query.pingcheck
    
    if(pingcheck) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: {pingdata : pingdata}
        };
    } else if (ping) {

        pingdata.push({query : req.query, body : req.body})

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "Ping"
        };
    } else {
        const result = await fetch(`http://as-go-covid19-d-001.azurewebsites.net/wp-json/wp/v2/pages?yo=1`)
        .then(response => response.json());
        
      context.res = {
          // status: 200, /* Defaults to 200 */
          body: {match : result},
          headers: {
              'Content-Type' : 'application/json'//,
              //"Cache-Control" : "public, max-age=84600" //1 day
          }
      };
    }

    context.done();
}