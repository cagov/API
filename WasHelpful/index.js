const CosmosClient = require('@azure/cosmos').CosmosClient
const config = require('./config')
const endpoint = config.endpoint
const key = config.key
const client = new CosmosClient({ endpoint, key })

module.exports = async function (context, req) {
    let timestamp = new Date().getTime()
    let insertBody = {
        time: timestamp,
        site: req.body.site,
        url: req.body.url,
        helpful: parseBoolean(req.body.helpful),
        comments: req.body.comments
    }

    const { item } = await client
        .database(config.database.id)
        .container(config.container.id)
        .items.upsert(insertBody)

    context.res = {
        headers: {
            'Content-Type' : 'application/json'
        },
        body: item
    };
}


