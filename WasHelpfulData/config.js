let config = {}
config.endpoint = process.env["COSMOS_ENDPOINT"];
config.key = process.env["COSMOS_KEY"];
config.requestor = process.env["FEEDBACK_REQUESTOR"]
config.database = {
  id: 'PageRatings'
}
config.container = {
  id: 'WasHelpful'
}

module.exports = config