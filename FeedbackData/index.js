const CosmosClient = require("@azure/cosmos").CosmosClient;
let config = require("./config.js");
const url = require('url');
const endpoint = config.endpoint;
const key = config.key;
const databaseId = config.database.id;
const containerId = config.container.id;
const client = new CosmosClient({ endpoint, key });

module.exports = async function (context, req) {
  async function queryContainer() {
    let startDate = new Date().getTime() - (1000 * 90 * 24 * 60 * 60);
    let querySpec = {
      query: `SELECT * FROM c WHERE c.time >= ${startDate}`,
      parameters: [],
    };
    if (req.query.url && req.query.requestor === config.requestor) {
      querySpec = {
        query: `SELECT * FROM c WHERE c.time >= ${startDate} AND CONTAINS(c.url, "${decodeURIComponent(context.req.query.url)}")`,
        parameters: [],
      };
    } else {
      return {"error": "missing parameters"};
    }

    const { resources: results } = await client
      .database(databaseId)
      .container(containerId)
      .items.query(querySpec)
      .fetchAll();
    return results.map(item => {
      let u = new URL(item.url);
      item.page = u.origin;
      item.pagesection = '/'+u.pathname;
      // there are no translated language urls on cannabis or drought
      delete item._rid;
      delete item._self;
      delete item._etag;
      delete item._attachments;
      delete item.time;
      item.helpful = (item.helpful ? "yes" : "no");
      item.timestamp = item._ts;
      delete item._ts;
      return item;
    }).sort((a, b) => a - b);
  }

  let responseMessage = await queryContainer();
  context.res = {
    body: responseMessage,
  };
};
