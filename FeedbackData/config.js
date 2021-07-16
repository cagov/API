let config = {}
config.endpoint = process.env["COSMOS_ENDPOINT_FEEDBACK"];
config.key = process.env["COSMOS_KEY_FEEDBACK"];
config.database = {
  id: 'PageRatings'
}
config.container = {
  id: 'WasHelpful'
}

module.exports = config