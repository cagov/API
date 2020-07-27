const CosmosClient = require('@azure/cosmos').CosmosClient
let config = require('./config.js')
const endpoint = config.endpoint
const key = config.key
const databaseId = config.database.id
const containerId = config.container.id
const client = new CosmosClient({ endpoint, key })

module.exports = async function (context, req) {
    if(req.body) {
        const myURL = new URL(req.body.url);
        let site = myURL.hostname;
        let helpful = '';
        if(req.body.helpful === 'yes') {
            helpful = true;
        }
        if(req.body.helpful === 'no') {
            helpful = false;
        }
        let comments = req.body.comments;
        let timestamp = new Date().getTime()
        let insertBody = {
            id: `${site}-${timestamp}-${Math.random()}`,
            time: timestamp,
            site: site,
            url: myURL.href,
            helpful: helpful,
            comments: comments
        }
    
        async function createItem(itemBody) {
            const { item } = await client
                .database(databaseId)
                .container(containerId)
                .items.upsert(itemBody)
            return({"message":`Created family item with id: ${itemBody.id}`})
        }
    
        let item = await createItem(insertBody)
    
        context.res = {
            headers: {
                'Content-Type' : 'application/json'
            },
            body: item
        };
    } else {
        context.res = {
            body: 'Hi'
        };
    }
}


  