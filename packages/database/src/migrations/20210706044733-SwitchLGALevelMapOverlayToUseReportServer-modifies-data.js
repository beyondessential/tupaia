'use strict';

import {
  insertObject,
  generateId,
  findSingleRecord,
  updateValues,
  arrayToDbString,
} from '../utilities';

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

const denominatorTitle = 'Respondents';
const denCode = 'FWV_LGA_004';
const mapOverlays = [
  {
    id: 'AU_FLUTRACKING_LGA_Fever_And_Cough',
    numeratorDataElementCode: 'FWV_LGA_004',
    denominatorDataElementCode: 'FWV_LGA_003',
    numeratorTitle: 'Fever and cough',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Fever_And_Cough_Causing_Absence',
    numeratorDataElementCode: 'FWV_LGA_005',
    numeratorTitle: 'Fever and cough causing absence from normal activities',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Vaccination_Rate_Flu',
    numeratorDataElementCode: 'FWV_LGA_006',
    numeratorTitle: 'Flu vaccinated',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Vaccinated_With_Fever_And_Cough',
    numeratorDataElementCode: 'FWV_LGA_007',
    numeratorTitle: 'Flu vaccinated with fever and cough',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Sought_Medical_Advice',
    numeratorDataElementCode: 'FWV_LGA_008',
    numeratorTitle: 'Participants who sought medical advice for fever and cough',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Tested_For_Flu',
    numeratorDataElementCode: 'FWV_LGA_009',
    numeratorTitle: 'Participants with symptoms tested for flu',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Tested_For_Covid',
    numeratorDataElementCode: 'FWV_LGA_010',
    numeratorTitle: 'Participants with symptoms tested for covid',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Tested_Positive_For_Flu',
    numeratorDataElementCode: 'FWV_LGA_011',
    numeratorTitle: 'Participants with symptoms tested positive for flu',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Tested_Positive_For_Covid',
    numeratorDataElementCode: 'FWV_LGA_012',
    numeratorTitle: 'Participants with symptoms tested positive for covid',
  },
];

const getReport = ({
  code,
  numeratorDataElementCode,
  denominatorDataElementCode,
  numeratorTitle,
}) => {
  const numTitle = `'${numeratorTitle}'`;
  const denTitle = `'${denominatorTitle}'`;
  return {
    code,
    config: {
      fetch: {
        aggregations: ['MOST_RECENT'],
        dataElements: [numeratorDataElementCode, denominatorDataElementCode],
      },
      transform: [
        {
          transform: 'aggregate',
          dataElement: 'group',
          organisationUnit: 'group',
          value: 'sum',
          '...': 'drop',
        },
        'keyValueByDataElementName',
        {
          transform: 'aggregate',
          organisationUnit: 'group',
          '...': 'sum',
        },
        {
          transform: 'filter',
          where: `exists($row.${numeratorDataElementCode}') and exists($row.${denominatorDataElementCode})`,
        },
        {
          transform: 'select',
          "'value'": `divide($row.${numeratorDataElementCode},$row.${denominatorDataElementCode})`,
          [numTitle]: `round($row.${numeratorDataElementCode})`,
          [denTitle]: `round($row.${denominatorDataElementCode})`,
          "'organisationUnitCode'": '$row.organisationUnit',
        },
      ],
    },
  };
};

exports.up = async function (db) {
  const permissionGroupId = (await findSingleRecord(db, 'permission_group', { name: 'Public' })).id;
  for (const mapOverlay of mapOverlays) {
    const {
      id,
      numeratorDataElementCode,
      denominatorDataElementCode = denCode,
      numeratorTitle,
    } = mapOverlay;
    await insertObject(db, 'report', {
      ...getReport({
        code: id,
        numeratorDataElementCode,
        denominatorDataElementCode,
        numeratorTitle,
      }),
      id: generateId(),
      permission_group_id: permissionGroupId,
    });

    await updateValues(
      db,
      'mapOverlay',
      {
        measureBuilder: 'useReportServer',
        measureBuilderConfig: { reportCode: id, dataSourceType: 'custom' },
      },
      { id },
    );
  }

  await db.runSql(`
    UPDATE "mapOverlay"
    SET "presentationOptions" = "presentationOptions" || '{"notLegacy": true}'::jsonb
    WHERE id in (${arrayToDbString(mapOverlays.map(m => m.id))})
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
