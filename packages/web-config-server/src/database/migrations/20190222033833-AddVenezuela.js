import { insertObject } from '../migrationUtilities';
import { existsSync, readFileSync } from 'fs';

('use strict');

var dbm;
var type;
var seed;

const BASE_PATH = 'src/database/migrationData/20190222033833-AddVenezuela';
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
const CODE_REPLACE = {
  á: 'a',
  í: 'i',
  ó: 'o',
  é: 'e',
};

function getCode(name) {
  var code = name;
  Object.entries(CODE_REPLACE).forEach(([src, dest]) => (code = code.replace(src, dest)));
  return 'VE_' + code.replace(/\W/g, '');
}

const VE_CHILDREN = PROVINCES.map(p => ({
  name: p,
  code: getCode(p),
  id: getCode(p),
  parent_code: 'VE',
  country_code: 'VE',
  type: 'region',
}));

async function addRegion(db, code) {
  const filePath = `${BASE_PATH}/${code}.geojson`;
  if (existsSync(filePath)) {
    const data = readFileSync(filePath) + '';

    return db.runSql(`
      UPDATE "entity"
      SET region = ST_GeomFromGeoJSON('${data}')
      WHERE code = '${code}';
    `);
  } else {
    return null;
  }
}

const CLINICS = [
  {
    id: 'AMA000',
    code: 'AMA000',
    parent_code: 'VE_Amazonas',
    name: 'Hospital Dr. José Gregorio Hernández',
    latitude: '5.666',
    longitude: '-67.624',
  },
  {
    id: 'ANZ000',
    code: 'ANZ000',
    parent_code: 'VE_Amazonas',
    name: 'Hospital Felipe Guevara Rojas',
    latitude: '8.896',
    longitude: '-64.240',
  },
  {
    id: 'ANZ001',
    code: 'ANZ001',
    parent_code: 'VE_Anzoategui',
    name: 'Hospital de Guaraguao',
    latitude: '10.234',
    longitude: '-64.627',
  },
  {
    id: 'ANZ002',
    code: 'ANZ002',
    parent_code: 'VE_Anzoategui',
    name: 'Hospital Universitario Dr. Luis Razzetti',
    latitude: '10.159',
    longitude: '-64.638',
  },
  {
    id: 'APU000',
    code: 'APU000',
    parent_code: 'VE_Anzoategui',
    name: 'Hospital Dr. Pablo Acosta Ortiz',
    latitude: '7.882',
    longitude: '-67.474',
  },
  {
    id: 'ARA000',
    code: 'ARA000',
    parent_code: 'VE_Anzoategui',
    name: 'Hospital Coronel Elbano Paredes Vivas',
    latitude: '10.247',
    longitude: '-67.574',
  },
  {
    id: 'ARA001',
    code: 'ARA001',
    parent_code: 'VE_Apure',
    name: 'Hospital Central de Maracay',
    latitude: '10.275',
    longitude: '-67.589',
  },
  {
    id: 'ARA002',
    code: 'ARA002',
    parent_code: 'VE_Aragua',
    name: 'Hospital José María Benítez',
    latitude: '10.233',
    longitude: '-67.325',
  },
  {
    id: 'BAR000',
    code: 'BAR000',
    parent_code: 'VE_Aragua',
    name: 'Hospital Dr. Luis Razetti',
    latitude: '8.621',
    longitude: '-70.204',
  },
  {
    id: 'BOL000',
    code: 'BOL000',
    parent_code: 'VE_Aragua',
    name: 'Hospital Ruiz y Páez',
    latitude: '8.133',
    longitude: '-63.532',
  },
  {
    id: 'BOL001',
    code: 'BOL001',
    parent_code: 'VE_Barinas',
    name: 'Hospital Uyapar',
    latitude: '8.285',
    longitude: '-62.736',
  },
  {
    id: 'CAR000',
    code: 'CAR000',
    parent_code: 'VE_Barinas',
    name: 'Ciudad Hospitalaria Enrique Tejera',
    latitude: '10.171',
    longitude: '-68.019',
  },
  {
    id: 'CAR001',
    code: 'CAR001',
    parent_code: 'VE_Bolivar',
    name: 'Hospital Dr. Ángel Larrralde',
    latitude: '10.291',
    longitude: '-68.000',
  },
  {
    id: 'COJ000',
    code: 'COJ000',
    parent_code: 'VE_Bolivar',
    name: 'Hospital General de San Carlos',
    latitude: '9.673',
    longitude: '-68.589',
  },
  {
    id: 'DEL000',
    code: 'DEL000',
    parent_code: 'VE_Bolivar',
    name: 'Hospital Dr. Luis Razetti',
    latitude: '9.058',
    longitude: '-62.039',
  },
  {
    id: 'DCA000',
    code: 'DCA000',
    parent_code: 'VE_DistritoCapital',
    name: 'Hospital JM de los Ríos. Dtto',
    latitude: '10.509',
    longitude: '-66.900',
  },
  {
    id: 'DCA001',
    code: 'DCA001',
    parent_code: 'VE_DistritoCapital',
    name: 'Hospital Vargas. Dtto',
    latitude: '10.516',
    longitude: '-66.911',
  },
  {
    id: 'DCA002',
    code: 'DCA002',
    parent_code: 'VE_DistritoCapital',
    name: 'Hospital Magallanes de Catia. Dtto',
    latitude: '10.517',
    longitude: '-66.955',
  },
  {
    id: 'DCA003',
    code: 'DCA003',
    parent_code: 'VE_DistritoCapital',
    name: 'Maternidad Concepción Palacios. Dtto',
    latitude: '10.495',
    longitude: '-66.932',
  },
  {
    id: 'DCA004',
    code: 'DCA004',
    parent_code: 'VE_DistritoCapital',
    name: 'Hospital Dr. Miguel Pérez Carreño. Dtto',
    latitude: '10.480',
    longitude: '-66.954',
  },
  {
    id: 'DCA005',
    code: 'DCA005',
    parent_code: 'VE_DistritoCapital',
    name: 'Hospital Universitario de Caracas. Dtto',
    latitude: '10.491',
    longitude: '-66.894',
  },
  {
    id: 'DCA006',
    code: 'DCA006',
    parent_code: 'VE_DistritoCapital',
    name: 'Hospital Militar. Dtto',
    latitude: '10.498',
    longitude: '-66.939',
  },
  {
    id: 'MON000',
    code: 'MON000',
    parent_code: 'VE_DistritoCapital',
    name: 'Hospital Universitario Dr. Manuel Núñez Tovar',
    latitude: '9.741',
    longitude: '-63.201',
  },
  {
    id: 'NES000',
    code: 'NES000',
    parent_code: 'VE_DistritoCapital',
    name: 'Hospital Dr. Luis Ortega',
    latitude: '10.961',
    longitude: '-63.848',
  },
  {
    id: 'FAL000',
    code: 'FAL000',
    parent_code: 'VE_Carabobo',
    name: 'Hospital Dr. Alfredo Van Grieken',
    latitude: '11.395',
    longitude: '-69.679',
  },
  {
    id: 'GUA000',
    code: 'GUA000',
    parent_code: 'VE_Carabobo',
    name: 'Hospital Dr. Israel Ranuarez Balza',
    latitude: '9.906',
    longitude: '-67.356',
  },
  {
    id: 'LAR000',
    code: 'LAR000',
    parent_code: 'VE_Carabobo',
    name: 'Hospital Universitario Dr. Antonio María Pineda',
    latitude: '10.082',
    longitude: '-69.311',
  },
  {
    id: 'MER000',
    code: 'MER000',
    parent_code: 'VE_Carabobo',
    name: 'Hospital Universitario de los Andes',
    latitude: '8.582',
    longitude: '-71.155',
  },
  {
    id: 'MIR000',
    code: 'MIR000',
    parent_code: 'VE_Cojedes',
    name: 'Hospital Domingo Luciani',
    latitude: '10.472',
    longitude: '-66.810',
  },
  {
    id: 'MIR001',
    code: 'MIR001',
    parent_code: 'VE_DeltaAmacuro',
    name: 'Hospital Victorino Santaella',
    latitude: '10.354',
    longitude: '-67.036',
  },
  {
    id: 'POR000',
    code: 'POR000',
    parent_code: 'VE_Falcon',
    name: 'Hospital Dr. Miguel Oraa',
    latitude: '9.052',
    longitude: '-69.735',
  },
  {
    id: 'SUC000',
    code: 'SUC000',
    parent_code: 'VE_Falcon',
    name: 'Hospital Antonio Patricio de Alcalá',
    latitude: '10.469',
    longitude: '-64.162',
  },
  {
    id: 'TAC000',
    code: 'TAC000',
    parent_code: 'VE_Falcon',
    name: 'Hospital Central de San Cristóbal',
    latitude: '7.756',
    longitude: '-72.226',
  },
  {
    id: 'TAC001',
    code: 'TAC001',
    parent_code: 'VE_Falcon',
    name: 'Hospital Patrocinio Peñuela',
    latitude: '7.794',
    longitude: '-72.217',
  },
  {
    id: 'TRU000',
    code: 'TRU000',
    parent_code: 'VE_Falcon',
    name: 'Hospital Universitario Dr. Pedro Emilio Carrillo',
    latitude: '9.318',
    longitude: '-70.610',
  },
  {
    id: 'VAR000',
    code: 'VAR000',
    parent_code: 'VE_Guarico',
    name: 'Hospital Dr. José María Vargas',
    latitude: '10.603',
    longitude: '-66.922',
  },
  {
    id: 'YAR000',
    code: 'YAR000',
    parent_code: 'VE_Lara',
    name: 'Hospital Plácido Rodriguez Rivero',
    latitude: '10.356',
    longitude: '-68.752',
  },
  {
    id: 'ZUL000',
    code: 'ZUL000',
    parent_code: 'VE_Lara',
    name: 'Hospital Universitario de Maracaibo',
    latitude: '10.673',
    longitude: '-71.628',
  },
  {
    id: 'ZUL001',
    code: 'ZUL001',
    parent_code: 'VE_Lara',
    name: 'Hospital General del Sur',
    latitude: '10.598',
    longitude: '-71.625',
  },
  {
    id: 'ADS0025',
    code: 'ADS0025',
    parent_code: 'VE_Merida',
    name: 'Sor Carmen Vega',
    latitude: '5.641',
    longitude: '-67.603',
  },
  {
    id: 'ADS0011',
    code: 'ADS0011',
    parent_code: 'VE_Merida',
    name: 'Padre Quinto',
    latitude: '10.217',
    longitude: '-64.636',
  },
  {
    id: 'ADS0017',
    code: 'ADS0017',
    parent_code: 'VE_Miranda',
    name: 'Don Bosco - Barinas',
    latitude: '8.621',
    longitude: '-70.253',
  },
  {
    id: 'ADS0026',
    code: 'ADS0026',
    parent_code: 'VE_Miranda',
    name: 'La Milagrosa - Maniapure',
    latitude: '6.927',
    longitude: '-66.561',
  },
  {
    id: 'ADS0006',
    code: 'ADS0006',
    parent_code: 'VE_Miranda',
    name: 'María Auxiliadora - Valencia',
    latitude: '10.181',
    longitude: '-68.008',
  },
  {
    id: 'ADS0007',
    code: 'ADS0007',
    parent_code: 'VE_Miranda',
    name: 'Don Bosco - Lomas de Funval',
    latitude: '10.128',
    longitude: '-68.018',
  },
  {
    id: 'ADS0000',
    code: 'ADS0000',
    parent_code: 'VE_Miranda',
    name: 'Complejo Social Don Bosco',
    latitude: '10.505',
    longitude: '-66.851',
  },
  {
    id: 'ADS0001',
    code: 'ADS0001',
    parent_code: 'VE_Miranda',
    name: 'María Auxiliadora - La Castellana',
    latitude: '10.506',
    longitude: '-66.853',
  },
  {
    id: 'ADS0020',
    code: 'ADS0020',
    parent_code: 'VE_Monagas',
    name: 'Don Bosco - Creolandia',
    latitude: '11.735',
    longitude: '-70.178',
  },
  {
    id: 'ADS0021',
    code: 'ADS0021',
    parent_code: 'VE_NuevaEsparta',
    name: 'Santa Cruz de los Taques',
    latitude: '11.820',
    longitude: '-70.257',
  },
  {
    id: 'ADS0018',
    code: 'ADS0018',
    parent_code: 'VE_NuevaEsparta',
    name: 'Padre Miguel González',
    latitude: '11.411',
    longitude: '-69.658',
  },
  {
    id: 'ADS0019',
    code: 'ADS0019',
    parent_code: 'VE_NuevaEsparta',
    name: 'Padre Pepe',
    latitude: '11.414',
    longitude: '-69.676',
  },
  {
    id: 'ADS0008',
    code: 'ADS0008',
    parent_code: 'VE_Portuguesa',
    name: 'María Auxiliadora - Barquisimeto',
    latitude: '10.061',
    longitude: '-69.331',
  },
  {
    id: 'ADS0009',
    code: 'ADS0009',
    parent_code: 'VE_Portuguesa',
    name: 'Padre Vigano',
    latitude: '10.088',
    longitude: '-69.336',
  },
  {
    id: 'ADS0014',
    code: 'ADS0014',
    parent_code: 'VE_Sucre',
    name: 'Maria Auxiliadora - Mérida',
    latitude: '8.596',
    longitude: '-71.163',
  },
  {
    id: 'ADS0002',
    code: 'ADS0002',
    parent_code: 'VE_Tachira',
    name: 'Mamá Margarita',
    latitude: '10.457',
    longitude: '-66.765',
  },
  {
    id: 'ADS0003',
    code: 'ADS0003',
    parent_code: 'VE_Tachira',
    name: 'La Milagrosa - Baruta',
    latitude: '10.434',
    longitude: '-66.875',
  },
  {
    id: 'ADS0004',
    code: 'ADS0004',
    parent_code: 'VE_Tachira',
    name: 'Gustavito García Luján',
    latitude: '10.425',
    longitude: '-66.825',
  },
  {
    id: 'ADS0005',
    code: 'ADS0005',
    parent_code: 'VE_Tachira',
    name: 'San José de Barlovento',
    latitude: '10.303',
    longitude: '-65.994',
  },
  {
    id: 'ADS0012',
    code: 'ADS0012',
    parent_code: 'VE_Trujillo',
    name: 'Hermanas Boada',
    latitude: '',
    longitude: '',
  },
  {
    id: 'ADS0013',
    code: 'ADS0013',
    parent_code: 'VE_Vargas',
    name: 'Nuestra Señora del Valle',
    latitude: '',
    longitude: '',
  },
  {
    id: 'ADS0010',
    code: 'ADS0010',
    parent_code: 'VE_Yaracuy',
    name: 'Nuestra Señora de la Corteza',
    latitude: '9.569',
    longitude: '-69.203',
  },
  {
    id: 'ADS0015',
    code: 'ADS0015',
    parent_code: 'VE_Zulia',
    name: 'Don Bosco - San Cristóbal ',
    latitude: '7.760',
    longitude: '-72.234',
  },
  {
    id: 'ADS0016',
    code: 'ADS0016',
    parent_code: 'VE_Zulia',
    name: 'Nuestra Señora de la Consolación',
    latitude: '7.816',
    longitude: '-72.227',
  },
  {
    id: 'ADS0022',
    code: 'ADS0022',
    parent_code: 'VE_Zulia',
    name: 'La Chinita',
    latitude: '10.564',
    longitude: '-71.625',
  },
  {
    id: 'ADS0023',
    code: 'ADS0023',
    parent_code: 'VE_Zulia',
    name: 'Nuestra Señora de la Candelaria',
    latitude: '10.708',
    longitude: '-71.631',
  },
  {
    id: 'ADS0024',
    code: 'ADS0024',
    parent_code: 'VE_Zulia',
    name: 'Domingo Savio',
    latitude: '10.633',
    longitude: '-71.658',
  },
];

async function addClinic(db, c) {
  const { latitude, longitude, ...rest } = c;
  await insertObject(db, 'entity', {
    type: 'facility',
    country_code: 'VE',
    ...rest,
  });

  const point = JSON.stringify({ type: 'Point', coordinates: [longitude, latitude] });

  await db.runSql(`
    UPDATE "entity" 
      SET "point" = ST_GeomFromGeoJSON('${point}')
      WHERE "code" = '${c.code}';
  `);
}

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  await db.runSql(`
    ALTER TABLE "entity" 
      ALTER COLUMN "name" TYPE VARCHAR(128);
  `);

  await insertObject(db, 'entity', {
    name: 'Venezuela',
    code: 'VE',
    id: 'VE',
    parent_code: 'World',
    country_code: 'VE',
    type: 'country',
  });

  await Promise.all(VE_CHILDREN.map(c => insertObject(db, 'entity', c)));

  await addRegion(db, 'VE');
  await Promise.all(VE_CHILDREN.map(c => addRegion(db, c.code)));

  await db.runSql(`
    UPDATE "entity" 
    SET "bounds" = ST_Envelope("region"::geometry) 
    WHERE "country_code" = 'VE';
  `);

  await Promise.all(CLINICS.map(c => addClinic(db, c)));
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "entity" WHERE "country_code" = 'VE';
  `);
};

exports._meta = {
  version: 1,
};
