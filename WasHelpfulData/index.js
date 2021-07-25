const CosmosClient = require("@azure/cosmos").CosmosClient;
let config = require("./config.js");
const url = require('url');
const dateFns = require('date-fns');
const endpoint = config.endpoint;
const key = config.key;
const databaseId = config.database.id;
const containerId = config.container.id;
const client = new CosmosClient({ endpoint, key });
let initialPaths = [
  {
    "prefix": '/ar/',
    "language": "Arabic"
  },
  {
    "prefix": '/es/',
    "language": "Spanish"
  },
  {
    "prefix": '/ko/',
    "language": "Korean"
  },
  {
    "prefix": '/tl/',
    "language": "Filipino"
  },
  {
    "prefix": '/vi/',
    "language": "Vietnamese"
  },
  {
    "prefix": '/zh-hans/',
    "language": "Chinese Simplified"
  },
  {
    "prefix": '/zh-hant/',
    "language": "Chinese Traditional"
  }
];

module.exports = async function (context, req) {
  async function queryContainer() {
    let startDate = new Date().getTime() - (1000 * 30 * 24 * 60 * 60);
    let querySpec = {
      query: `SELECT * FROM c WHERE c.time >= ${startDate}`,
      parameters: [],
    };
    if (req.query.requestor !== config.requestor) {
      return {"error": "missing parameters"};
    }

    const { resources: results } = await client
      .database(databaseId)
      .container(containerId)
      .items.query(querySpec)
      .fetchAll();
    console.log("TOTAL RESULTS")
    console.log(results.length)
    return results.map(item => {
      let u = new URL(item.url);
      item.page = u.pathname + u.search;
      item.pagesection = u.hash;
      item.language = 'English';
      initialPaths.forEach(x => {
        if(u.pathname.indexOf(x.prefix) === 0) {
          item.language = x.language;
          item.page = u.pathname.replace(x.prefix,'/')  + u.search;
        }  
      })
      item.helpful = (item.helpful ? "yes" : "no");
      item.timestamp = dateFns.format(new Date(item.time), 'MMM dd, yyyy h:m a');
      item.epoch_time = item.time;
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
    // status: 200, /* Defaults to 200 */
    body: responseMessage,
  };
};
