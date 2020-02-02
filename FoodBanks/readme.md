# Food Banks

- Will return a set of food banks in California closest to a lat,lon 
- Will return our full dataset as geojson if no lat,lon query parameters are sent

## Development

To add new food banks:

- Add them to the csv file
- Run ```scripts/transform.js``` to transform the csv to json
- Deploy new version of the function to azure