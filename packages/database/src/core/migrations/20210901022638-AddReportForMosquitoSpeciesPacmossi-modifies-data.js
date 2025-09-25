'use strict';

import { generateId, insertObject } from '../utilities';

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

const PERMISSION_GROUP = 'PacMOSSI';

const dataElementsToNames = {
  PMOS_An_Farauti: 'An. farauti',
  PMOS_An_Koliensis: 'An. koliensis',
  PMOS_An_Punctulatus: 'An. punctulatus',
  PMOS_Ae_Aegypti: 'Ae. aegypti',
  PMOS_Ae_Albopictus: 'Ae. albopictus',
  PMOS_Ae_Cooki: 'Ae. cooki',
  PMOS_Ae_Hensilli: 'Ae. hensilli',
  PMOS_Ae_Marshallensis: 'Ae. marshallensis',
  PMOS_Ae_Polynesiensis: 'Ae. polynesiensis',
  PMOS_Ae_Rotumae: 'Ae. rotumae',
  PMOS_Ae_Scutellaris: 'Ae. scutellaris',
  PMOS_Ae_Vigilax: 'Ae. vigilax',
  PMOS_Cx_Annulirostris: 'Cx. annulirostris',
  PMOS_Cx_Quinquefasciatus: 'Cx. quinquefasciatus',
  PMOS_Cx_Sitiens: 'Cx. sitiens',
  PMOS_Mn_Uniformis: 'Mn. uniformis',
};

const permissionGroupNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

const REPORT = {
  id: generateId(),
  code: 'PacMosssi_Mosquito_Species_District',
  config: {
    fetch: {
      dataElements: Object.keys(dataElementsToNames),
      aggregations: [
        {
          type: 'SUM_PER_ORG_GROUP',
          config: { dataSourceEntityType: 'field_station', aggregationEntityType: 'district' },
        },
      ],
    },
    transform: [
      {
        transform: 'updateColumns',
        insert: {
          numerator: '=$value',
          denominator:
            '=sum(where(f($otherRow) = equalText($otherRow.organisationUnit, $organisationUnit)).value)',
          name: `=translate($dataElement, ${JSON.stringify(dataElementsToNames)})`,
          organisationUnitCode: '=$organisationUnit',
        },
        exclude: '*',
      },

      { transform: 'excludeRows', where: '=$denominator <= 0' },
      {
        transform: 'updateColumns',
        insert: {
          value: 'exists',
          '=$name': '=formatAsFractionAndPercentage($numerator, $denominator)',
        },
        include: ['organisationUnitCode'],
      },
      { transform: 'mergeRows', groupBy: 'organisationUnitCode', using: 'last' },
    ],
  },
};

exports.up = async function (db) {
  const permissionGroupId = await permissionGroupNameToId(db, PERMISSION_GROUP);
  await insertObject(db, 'report', { ...REPORT, permission_group_id: permissionGroupId });
};

exports.down = async function (db) {
  return db.runSql(`
   DELETE FROM "report" WHERE code = '${REPORT.code}';
  `);
};

exports._meta = {
  version: 1,
};
