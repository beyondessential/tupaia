'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const PROVINCES = {
  Attapeu: {
    capital: {
      code: 'LA_PROV_CAPITAL_XAISETTHA',
      subDistrictCode: 'LA_Samakkhixay District',
    },
  },
  Bokeo: {
    capital: {
      code: 'LA_PROV_CAPITAL_HOUAYXAY',
      subDistrictCode: 'LA_Huoixai District',
    },
  },
  Bolikhamsai: {
    capital: {
      code: 'LA_PROV_CAPITAL_PAKSAN',
      subDistrictCode: 'LA_Pakxane District',
    },
  },
  Champasak: {
    capital: {
      code: 'LA_PROV_CAPITAL_PAKSE',
      subDistrictCode: 'LA_Pakse District',
    },
  },
  Houaphanh: {
    capital: {
      code: 'LA_PROV_CAPITAL_SAM_NEUA',
      subDistrictCode: 'LA_Xamneua District',
    },
  },
  Khammouane: {
    capital: {
      code: 'LA_PROV_CAPITAL_THAKHEK',
      subDistrictCode: 'LA_Thakhek District',
    },
  },
  'Luang Namtha': {
    capital: {
      code: 'LA_PROV_CAPITAL_NAMTHA',
      subDistrictCode: 'LA_Namtha District',
    },
  },
  'Luang Prabang': {
    capital: {
      code: 'LA_PROV_CAPITAL_LUANG_PRABANG',
      subDistrictCode: 'LA_Luangprabang District',
    },
  },
  Oudomxay: {
    capital: {
      code: 'LA_PROV_CAPITAL_XAI',
      subDistrictCode: 'LA_Xay District',
    },
  },
  Phongsaly: {
    capital: {
      code: 'LA_PROV_CAPITAL_PHONGSALI',
      subDistrictCode: 'LA_Phongsaly District',
    },
  },
  Xainyabuli: {
    capital: {
      code: 'LA_PROV_CAPITAL_XAINYABULI',
      lat: '19.25,', // These were wrong in the last import
      lon: '101.75',
      subDistrictCode: 'LA_Xayabury District',
    },
  },
  Salavan: {
    capital: {
      code: 'LA_PROV_CAPITAL_SALAVAN',
      subDistrictCode: 'LA_Saravane District',
    },
  },
  Savannakhet: {
    capital: {
      code: 'LA_PROV_CAPITAL_KAYSONE_PHOMVIHANE',
      subDistrictCode: 'LA_KaysonePhomvihane District',
    },
  },
  Xekong: {
    capital: {
      code: 'LA_PROV_CAPITAL_LAMARN',
      subDistrictCode: 'LA_Lamarm District',
    },
  },
  'Vientiane Capital': {
    capital: {
      code: 'LA_PROV_CAPITAL_SISATTANAK',
      subDistrictCode: 'LA_Sisattanak District',
    },
  },
  'Vientiane Province': {
    capital: {
      code: 'LA_PROV_CAPITAL_PHÔNHÔNG',
      subDistrictCode: 'LA_Phonhong District',
    },
  },
  Xiangkhouang: {
    capital: {
      code: 'LA_PROV_CAPITAL_PEK',
      subDistrictCode: 'LA_Pek District',
    },
  },
  Xaisomboun: {
    capital: {
      code: 'LA_PROV_CAPITAL_ANOUVONG',
      subDistrictCode: 'LA_Anouvong District',
    },
  },
};

const getEntityId = async (db, code) => {
  const results = await db.runSql(`SELECT id FROM entity WHERE code = '${code}';`);

  if (results.rows.length > 0) {
    return results.rows[0].id;
  }

  throw new Error('Entity not found');
};

const getEntityHierarchyId = async (db, name) => {
  const results = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}';`);

  if (results.rows.length > 0) {
    return results.rows[0].id;
  }

  throw new Error('Entity hierarchy not found');
};

exports.up = async function (db) {
  // 1. Update wrong coords for Xainyabuli
  const point = {
    type: 'Point',
    coordinates: [PROVINCES.Xainyabuli.capital.lon, PROVINCES.Xainyabuli.capital.lat],
  };
  await db.runSql(
    `UPDATE entity SET point = ST_Force2D(ST_GeomFromGeoJSON('${JSON.stringify(
      point,
    )}')) WHERE code = '${PROVINCES.Xainyabuli.capital.code}';`,
  );

  // 2. Move cities under sub_district
  const laosEocEntityHierarchyId = await getEntityHierarchyId(db, 'laos_eoc');

  for (const provinceName of Object.keys(PROVINCES)) {
    const province = PROVINCES[provinceName];

    const subDistrictId = await getEntityId(db, province.capital.subDistrictCode);

    const cityId = await getEntityId(db, province.capital.code);

    await db.runSql(`UPDATE entity SET parent_id = '${subDistrictId}' WHERE id = '${cityId}';`);

    await db.runSql(
      `DELETE FROM entity_relation WHERE child_id = '${cityId}' AND entity_hierarchy_id = '${laosEocEntityHierarchyId}';`,
    );

    await db.runSql(`
      INSERT INTO entity_relation (id, parent_id, child_id, entity_hierarchy_id)
      VALUES (generate_object_id(), '${subDistrictId}', '${cityId}', '${laosEocEntityHierarchyId}');
    `);
  }
};

exports.down = async function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
