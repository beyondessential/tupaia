# Importing GeoJSON

> [!NOTE]
> This is based on how this system works as of June 2019, where we imported Laos using this method.

### Case 1: Automatically importing GeoJSON for a totally new country/district

- We can now use the facility importer to automatically set up the GeoJSON for a whole new country/district.
- The country level GeoJSON is handled by the sheet name of the import spreadsheet, so if the sheet name is “Laos” then the importer will automatically detect the GeoJSON for Laos and use that.
- GeoJSON can be detected automatically too based on the names in the District and Subdistrict columns.
- This is the default way to use this importer, but district and subdistricts can be specified by the importer too, documented below in [Case 1.1](#case11-importing-specific-geojson-for-a-totally-new-countrydistrict).

### Case 1.1: Importing specific GeoJSON for a totally new country/district

If the district has already been imported into our system, skip to [Case 2](#case2-updating-geojson-for-an-existing-district).

- To handle importing specific GeoJSON for a district there is now a new column in the facility import file that can be used, called `district_osm_id` (and `sub_district_osm_id` for subdistricts)
- The value for this column can be found on [Nominatim](https://nominatim.openstreetmap.org):
	- Search the district we want the GeoJSON information for. Click <kbd>details</kbd>.
	- In the details table, there should be a row called “OSM” with a value like “relation 5831798”.
	- The number is the value we will be using in our import file.
- For a facility in each district add the district GeoJSON by copying the number found in the previous step (e.g `5831798`) into the `district_osm_id` column.
- Import this file through the facilities tab on **admin-panel** and we should be good to go!

### Case 2: Updating GeoJSON for an existing district

This is similar to the previous case but with a few extra steps beforehand.

- In the database we need to first go into the `entity` table, find the district we want to update and delete whatever is in the `region` column (so it now says `NULL`).
- Then we need to delete the cached GeoJSON. To do this SSH into **central-server**, go to `uploads/GeoJSON/Laos` (or whatever the country you want to update is).
- Typing `ls` should list the documents in this folder. Find the districts you want to update and delete their cached GeoJSON with `rm LA_Xayabury.geojson` (except with whatever the district you want to replace is called).
- Once this is done you can use the importer like in [Case 1.1](#case11-importing-specific-geojson-for-a-totally-new-countrydistrict).
