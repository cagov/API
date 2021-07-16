const CosmosClient = require("@azure/cosmos").CosmosClient;
let config = require("./config.js");
const endpoint = config.endpoint;
const key = config.key;
const databaseId = config.database.id;
const containerId = config.container.id;
const client = new CosmosClient({ endpoint, key });

module.exports = async function (context, req) {
  async function queryContainer() {
    let startDate = new Date().getTime() - (1000 * 90 * 24 * 60 * 60);
    // remove some fields
    // figure out what the connection params are
    if (context.req.query.url) {
      let querySpec = {
        query: `SELECT * FROM c WHERE c.time >= ${startDate} AND CONTAINS(c.url, "${decodeURIComponent(context.req.query.url)}")`,
        parameters: [],
      };
    } else {
      return {"error": "url query parameter required"};
    }

    const { resources: results } = await client
      .database(databaseId)
      .container(containerId)
      .items.query(querySpec)
      .fetchAll();
    for (var queryResult of results) {
      let resultString = JSON.stringify(queryResult);
      console.log(`\tQuery returned ${resultString}\n`);
    }
    return results;
  }

  let responseMessage = await queryContainer();
  context.res = {
    // status: 200, /* Defaults to 200 */
    body: responseMessage,
  };
};
