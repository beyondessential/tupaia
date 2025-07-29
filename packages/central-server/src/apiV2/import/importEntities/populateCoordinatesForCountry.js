import { get } from 'es-toolkit/compat';
import winston from 'winston';
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'fs';
import { fetchWithTimeout, HttpError } from '@tupaia/utils';

const BASE_PATH = 'uploads/geojson';

const CODE_REPLACE = {
  á: 'a',
  í: 'i',
  ó: 'o',
  é: 'e',
};

function getLatin1(name) {
  let safe = name;
  Object.entries(CODE_REPLACE).forEach(([src, dest]) => {
    safe = safe.replace(src, dest);
  });
  return safe;
}

function extractBestMatch(data) {
  if (!data || !data.filter) {
    winston.error(data);
    return null;
  }
  return data.filter(x => x.class === 'boundary' && x.type === 'administrative')[0];
}

async function searchGeojson(name, countryName) {
  const search = getLatin1(`${name}, ${countryName}`);
  const url = `http://nominatim.openstreetmap.org/search?polygon_geojson=1&format=json&q=${search}`;
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new HttpError(response);
  }
  const results = await response.json();
  const bestMatch = extractBestMatch(results);
  if (!bestMatch || !bestMatch.geojson) {
    throw new Error('No match');
  }

  const { geojson } = bestMatch;
  return geojson;
}

async function fetchGeojsonForOsmId(openStreetMapsId) {
  const url = `http://polygons.openstreetmap.fr/get_geojson.py?params=0&id=${openStreetMapsId}`;
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new HttpError(response);
  }
  const results = await response.json();
  return results.geometries[0];
}

async function fetchGeojson(name, countryName, openStreetMapsId) {
  const geojson = await (openStreetMapsId
    ? fetchGeojsonForOsmId(openStreetMapsId)
    : searchGeojson(name, countryName));

  if (geojson.type === 'Polygon') {
    geojson.type = 'MultiPolygon';
    geojson.coordinates = [geojson.coordinates];
  }

  return geojson;
}

async function addCoordinatesToEntity(
  transactingModels,
  countryName,
  name,
  code,
  openStreetMapsId,
) {
  const directoryPath = `${BASE_PATH}/${countryName}`;
  const filePath = `${directoryPath}/${code}.geojson`;

  // Download the geojson for this entity if we haven't done so before (may have been done
  // outside of the import process if geojson needed manual tweaking, for example)
  if (!existsSync(filePath)) {
    try {
      const geojson = await fetchGeojson(name, countryName, openStreetMapsId);
      if (!existsSync(directoryPath)) {
        mkdirSync(directoryPath, { recursive: true });
      }
      writeFileSync(filePath, JSON.stringify(geojson));
    } catch (error) {
      throw new Error(
        `Failed to automatically fetch geoJSON for ${name}, ${countryName}. Please add manually in the "geojson" import column and turn off "Automatically fetch GeoJSON".`,
      );
    }
  }

  // Get the geojson from file rather than directly from open street maps as a) caching makes it
  // faster if repeated, and b) it allows us to manually tweak the geojson, get it from a
  // different source, or compress it by reducing the number of nodes
  const geojson = JSON.parse(readFileSync(filePath));
  return transactingModels.entity.updateRegionCoordinates(code, geojson);
}

// Go through country and all district/subdistricts, and if any are missing coordinates,
// attempt to fetch them (either from disk or open street maps) and populate the database
export async function populateCoordinatesForCountry(transactingModels, countryCode) {
  const countryEntity = await transactingModels.entity.findOne({ code: countryCode });
  const countryName = countryEntity.name;
  const entitiesWithoutCoordinates = await transactingModels.entity.find({
    country_code: countryCode,
    type: [transactingModels.entity.types.DISTRICT, transactingModels.entity.types.SUB_DISTRICT],
    region: null, // Only bother with entities that don't already have their region coordinates set
  });
  for (const { name, code, metadata } of entitiesWithoutCoordinates) {
    const openStreetMapsId = get(metadata, 'openStreetMaps.id');
    await addCoordinatesToEntity(transactingModels, countryName, name, code, openStreetMapsId);
  }
  if (!countryEntity.region) {
    await addCoordinatesToEntity(transactingModels, countryName, countryName, countryEntity.code);
  }
}
