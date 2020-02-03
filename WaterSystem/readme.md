# Water System Identification

Pass in a lat, lon as query parameters, receive some metadata about the system that contains the point.

## Dataset

Initially used the published dataset from <a href="https://data.ca.gov/dataset/drinking-water-water-system-service-area-boundaries">https://data.ca.gov/dataset/drinking-water-water-system-service-area-boundaries</a> but found more system boundaries in the data from <a href="https://trackingcalifornia.org/water/download">https://trackingcalifornia.org/water/download</a>. Specifically Brentwood points were not inside a system in the data.ca.gov dataset reviewed on 2/3/2020.

### Data evaluation

There is an existing application <a href="https://www.arcgis.com/apps/MapJournal/index.html?appid=143794cd74e344a29eb8b96190f4658b#">https://www.arcgis.com/apps/MapJournal/index.html?appid=143794cd74e344a29eb8b96190f4658b#</a> which provides similar point to water system identification in an interactive map.

## Future improvements

Currently this endpoint is using the 22MB data file from trackingcalifornia. This could be slimmed down by removing retired, duplicate data from that dataset. The point matching also just loops through all polygons in all the multi polygon systems, that point matching logic could be sped up.


