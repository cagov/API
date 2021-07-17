let config = {}
config.endpoint = process.env["COSMOS_ENDPOINT_FEEDBACK"];
config.key = process.env["COSMOS_KEY_FEEDBACK"];
config.requestor = process.env["FEEDBACK_REQUESTOR"]
config.database = {
  id: 'Feedback'
}
config.container = {
  id: 'pagefeedback'
}

module.exports = config