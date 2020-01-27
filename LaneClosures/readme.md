# Lane Closures

Retrieve current lane closure information for a specific highway inside a bounding box

## Data source

Caltrans CCWWP, could consume all the separate district specific json files from Caltrans web portal like: http://cwwp2.dot.ca.gov/data/d1/lcs/lcsStatusD01.json

Could combine lane closures with full highway closures and chain warnings

## Interface

Make the data available to client side applications who want to query by:

- Route identifier
- direction of travel
- bounding box

## Example

Call this endpoint: https://api.alpha.ca.gov/LaneClosures/US-50?lat1=38.573832&lat2=38.956177&lon1=-121.490044&lon2=-119.942837&direction=East

More documentation <a href="https://documenter.getpostman.com/view/9918160/SWLb8Uep?version=latest#acf4d679-b0cf-4166-a614-049fd1870732">on postman</a>