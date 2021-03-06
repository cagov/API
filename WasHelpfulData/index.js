const CosmosClient = require("@azure/cosmos").CosmosClient;
let config = require("./config.js");
const endpoint = config.endpoint;
const key = config.key;
const databaseId = config.database.id;
const containerId = config.container.id;
const client = new CosmosClient({ endpoint, key });

module.exports = async function (context, req) {
  async function queryContainer() {
    let querySpec = {
      query: "SELECT * FROM c",
      parameters: [],
    };
    if (context.req.params.start && context.req.params.end) {
      querySpec = {
        query: `SELECT * FROM c WHERE c.time >= ${context.req.params.start} AND c.time <= ${context.req.params.end}`,
        parameters: [],
      };
      if (context.req.query.url) {
        querySpec = {
          query: `SELECT * FROM c WHERE c.time >= ${context.req.params.start} AND c.time <= ${context.req.params.end} AND CONTAINS(c.url, "${decodeURIComponent(context.req.query.url)}")`,
          parameters: [],
        };
      }
      if (context.req.query.clause) {
        querySpec = {
          query: `SELECT * FROM c WHERE c.time >= ${context.req.params.start} AND c.time <= ${context.req.params.end} AND (${decodeURIComponent(context.req.query.clause)})`,
          parameters: [],
        };
      }
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
