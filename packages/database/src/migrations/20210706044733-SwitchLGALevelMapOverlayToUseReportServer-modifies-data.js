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
    denominatorDataElementCode: 'FWV_LGA_003',
    numeratorTitle: 'Fever and cough causing absence from normal activities',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Vaccination_Rate_Flu',
    numeratorDataElementCode: 'FWV_LGA_006',
    denominatorDataElementCode: 'FWV_LGA_003',
    numeratorTitle: 'Flu vaccinated',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Vaccinated_With_Fever_And_Cough',
    numeratorDataElementCode: 'FWV_LGA_007',
    denominatorDataElementCode: 'FWV_LGA_003',
    numeratorTitle: 'Flu vaccinated with fever and cough',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Sought_Medical_Advice',
    numeratorDataElementCode: 'FWV_LGA_008',
    denominatorDataElementCode: 'FWV_LGA_004',
    numeratorTitle: 'Participants who sought medical advice for fever and cough',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Tested_For_Flu',
    numeratorDataElementCode: 'FWV_LGA_009',
    denominatorDataElementCode: 'FWV_LGA_004',
    numeratorTitle: 'Participants with symptoms tested for flu',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Tested_For_Covid',
    numeratorDataElementCode: 'FWV_LGA_010',
    denominatorDataElementCode: 'FWV_LGA_004',
    numeratorTitle: 'Participants with symptoms tested for covid',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Tested_Positive_For_Flu',
    numeratorDataElementCode: 'FWV_LGA_011',
    denominatorDataElementCode: 'FWV_LGA_004',
    numeratorTitle: 'Participants with symptoms tested positive for flu',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Tested_Positive_For_Covid',
    numeratorDataElementCode: 'FWV_LGA_012',
    denominatorDataElementCode: 'FWV_LGA_004',
    numeratorTitle: 'Participants with symptoms tested positive for covid',
  },
  // District Level
  {
    id: 'AU_FLUTRACKING_Fever_And_Cough',
    numeratorDataElementCode: 'FWV_004',
    denominatorDataElementCode: 'FWV_003',
    numeratorTitle: 'Fever and cough',
  },
  {
    id: 'AU_FLUTRACKING_Fever_And_Cough_Causing_Absence',
    numeratorDataElementCode: 'FWV_005',
    denominatorDataElementCode: 'FWV_003',
    numeratorTitle: 'Fever and cough causing absence from normal activities',
  },
  {
    id: 'AU_FLUTRACKING_Vaccination_Rate_Flu',
    numeratorDataElementCode: 'FWV_006',
    denominatorDataElementCode: 'FWV_003',
    numeratorTitle: 'Flu vaccinated',
  },
  {
    id: 'AU_FLUTRACKING_Vaccinated_With_Fever_And_Cough',
    numeratorDataElementCode: 'FWV_007',
    denominatorDataElementCode: 'FWV_003',
    numeratorTitle: 'Flu vaccinated with fever and cough',
  },
  {
    id: 'AU_FLUTRACKING_Sought_Medical_Advice',
    numeratorDataElementCode: 'FWV_008',
    denominatorDataElementCode: 'FWV_004',
    numeratorTitle: 'Participants who sought medical advice for fever and cough',
  },
  {
    id: 'AU_FLUTRACKING_Tested_For_Flu',
    numeratorDataElementCode: 'FWV_009',
    denominatorDataElementCode: 'FWV_004',
    numeratorTitle: 'Participants with symptoms tested for flu',
  },
  {
    id: 'AU_FLUTRACKING_Tested_For_Covid',
    numeratorDataElementCode: 'FWV_010',
    denominatorDataElementCode: 'FWV_004',
    numeratorTitle: 'Participants with symptoms tested for covid',
  },
  {
    id: 'AU_FLUTRACKING_Tested_Positive_For_Flu',
    numeratorDataElementCode: 'FWV_011',
    denominatorDataElementCode: 'FWV_004',
    numeratorTitle: 'Participants with symptoms tested positive for flu',
  },
  {
    id: 'AU_FLUTRACKING_Tested_Positive_For_Covid',
    numeratorDataElementCode: 'FWV_012',
    denominatorDataElementCode: 'FWV_004',
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
          [numTitle]: `round($row.${numeratorDataElementCode} * 100) / 100`,
          [denTitle]: `round($row.${denominatorDataElementCode}  * 100) / 100`,
          "'organisationUnitCode'": '$row.organisationUnit',
        },
      ],
    },
  };
};

exports.up = async function (db) {
  const permissionGroupId = (await findSingleRecord(db, 'permission_group', { name: 'Public' })).id;
  for (const mapOverlay of mapOverlays) {
    const { id, numeratorDataElementCode, denominatorDataElementCode, numeratorTitle } = mapOverlay;
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
    SET "presentationOptions" = "presentationOptions" || '{"measureConfig": {"$all":{ "type": "null"}}}'::jsonb
    WHERE id in (${arrayToDbString(mapOverlays.map(m => m.id))})
  `);

  await db.runSql(`
    UPDATE "mapOverlay"
    SET "presentationOptions" = "presentationOptions" || '{"info":{"reference":{"text":"The raw numbers displayed can have decimal places because postcodes do not all fit within single LGAs in Australia and we use ratio tables to convert postcode data to LGAs."}}}'::jsonb
    WHERE id in (${arrayToDbString(
      mapOverlays.filter(({ id }) => id.includes('LGA')).map(m => m.id),
    )})
`);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
