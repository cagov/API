const CosmosClient = require("@azure/cosmos").CosmosClient;
let config = require("./config.js");
const endpoint = config.endpoint;
const key = config.key;
const databaseId = config.database.id;
const containerId = config.container.id;
const client = new CosmosClient({ endpoint, key });

module.exports = async function (context, req) {
  let timestamp = new Date().getTime();
  let insertBody = {
    id: `pledge-${timestamp}-${Math.random()}`,
    time: timestamp
  };
  for (const [key, value] of Object.entries(req.query)) {
    insertBody[key] = value;
  }

  async function createItem(itemBody) {
    const { item } = await client
      .database(databaseId)
      .container(containerId)
      .items.upsert(itemBody);
    return { message: `Created family item with id: ${itemBody.id}` };
  }

  // let item = await createItem(insertBody);

  context.res = {
    headers: {
      "Content-Type": "application/json",
    },
    body: insertBody,
  };
};
