import { get } from 'request';
import { writeFileSync, existsSync } from 'fs';

const PROVINCES = [
  'Amazonas',
  'Anzoátegui',
  'Apure',
  'Aragua',
  'Barinas',
  'Bolívar',
  'Carabobo',
  'Cojedes',
  'Delta Amacuro',
  'Dependencias Federales',
  'Distrito Capital',
  'Falcón',
  'Guárico',
  'Lara',
  'Miranda',
  'Monagas',
  'Mérida',
  'Nueva Esparta',
  'Portuguesa',
  'Sucre',
  'Trujillo',
  'Táchira',
  'Vargas',
  'Yaracuy',
  'Zulia',
];

const BASE_PATH = 'src/database/migrationData/20190222033833-AddVenezuela';

const CODE_REPLACE = {
  á: 'a',
  í: 'i',
  ó: 'o',
  é: 'e',
};

function getLatin1(name) {
  var safe = name;
  Object.entries(CODE_REPLACE).forEach(([src, dest]) => (safe = safe.replace(src, dest)));
  return safe;
}

function getCode(name) {
  return 'VE_' + getLatin1(name).replace(/\W/g, '');
}

async function downloadProvince(name) {
  const search = getLatin1(name);
  const url = `http://nominatim.openstreetmap.org/search?polygon_geojson=1&format=json&q=${search}`;
  const data = await new Promise((resolve, reject) => {
    get(url, (err, response, body) => (err ? reject(err) : resolve(body)));
  });

  return JSON.parse(data);
}

function extractBestMatch(data) {
  if (!data || !data.filter) {
    console.error(data);
    return {};
  }
  return data.filter(x => x.class === 'boundary' && x.type === 'administrative')[0];
}

async function process(name) {
  const code = getCode(name);
  const path = `${BASE_PATH}/${code}.geojson`;

  if (existsSync(path)) {
    // console.log('Skipped', code);
    return;
  }

  console.log('Getting', name, code);

  const results = await downloadProvince(`${name}, Venezuela`);
  try {
    const { geojson } = extractBestMatch(results);

    if (!geojson) {
      console.log('Couldnt get', code);
      return;
    }

    if (geojson.type === 'Polygon') {
      geojson.type = 'MultiPolygon';
      geojson.coordinates = [geojson.coordinates];
    }
    const data = JSON.stringify(geojson);

    writeFileSync(path, data);
    console.log('Wrote', code);
  } catch (e) {
    console.log('EEE', e);
    return;
  }
}

async function run() {
  await Promise.all(PROVINCES.map(process));
}

run();
