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
      item.page = u.pathname;
      let re = new RegExp('/#.+');
      item.page_section = re.exec(u);
      // there are no translated language urls on cannabis or drought
      item.helpful = (item.helpful ? "yes" : "no");
      let date_obj = new Date(item.time);
      // adjust 0 before single digit date
      let date = ("0" + date_obj.getDate()).slice(-2);
      // current month
      let month = ("0" + (date_obj.getMonth() + 1)).slice(-2);

      item.timestamp = date_obj.getFullYear() + "-" + month + "-" + date; //  + " " + date_obj.getHours() + ":" + date_obj.getMinutes() + ":" + date_obj.getSeconds()
      delete item._attachments;
      delete item._etag;
      delete item._rid;
      delete item._self;
      delete item._ts;
      delete item.time;
      return item;
    }).sort((a, b) => a - b);
  }

  let responseMessage = await queryContainer();
  context.res = {
    body: responseMessage,
  };
};
