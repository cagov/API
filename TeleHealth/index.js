const providers = require('./telehealth.json');

module.exports = async function (context, req) {
    const input = context.req.params.county;
    let outputArr = [];
    providers.telehealthList.forEach( (pro) => {
        if(pro.County.toLowerCase() == input.toLowerCase()) {
            outputArr.push(pro);
        }
    })

    context.res = {
        body: outputArr,
        
        headers: {
            'Content-Type' : 'application/json',
            "Cache-Control" : "public, max-age=84600" //1 day
        }
    };
}