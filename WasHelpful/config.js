var config = {}

config.endpoint = 'https://db-go-covid-d-002.documents.azure.com:443/'
config.key = '98RHGU51eCkm97swuupdoV5ETYpOrbPtYiAolSHkAbCZIE7CKuHVr9u9uFqiGCRYGejqaYvj3tx0xHuN42nN2Q=='

config.database = {
  id: 'WasHelpful'
}

config.container = {
  id: 'covid19'
}

config.items = {
  test: {
    id: 'test.1',
    site: 'covid19.ca.gov',
    url: 'https://covid19.ca.gov/roadmap-counties/',
    helpful: true,
    comments: 'Hello there'
  }
}

module.exports = config
