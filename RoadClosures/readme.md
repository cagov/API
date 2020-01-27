# Full road closures

Retrieve current full road closure information inside a bounding box. Full road closures like seasonal closures are not available in the related lane closures API

## Data source

Data is retrieved from the KML file used in Caltrans Quickmaps and transformed into json

## Interface

Pass 4 query parameters to identify the bounding box:

- lat1
- lon1
- lat2
- lon2

## Example

Call this endpoint: https://api.alpha.ca.gov/RoadClosures?lat1=38.573832&lat2=38.956177&lon1=-121.490044&lon2=-119.942837

More documentation <a href="https://documenter.getpostman.com/view/9918160/SWLb8Uep?version=latest#acf4d679-b0cf-4166-a614-049fd1870732">on postman</a>