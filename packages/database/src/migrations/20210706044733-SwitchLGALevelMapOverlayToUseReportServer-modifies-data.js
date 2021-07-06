'use strict';

import {
  insertObject,
  generateId,
  findSingleRecord,
  findSingleRecordBySql,
  updateValues,
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

const report = ({
  code,
  numeratorDataElementCode,
  denominatorDataElementCode,
  numeratorTitle,
  denominatorTitle,
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
          '$row.organisationUnit': `divide($row.${numeratorDataElementCode},$row.${denominatorDataElementCode})`,
          [numTitle]: `round($row.${numeratorDataElementCode})`,
          [denTitle]: `round($row.${denominatorDataElementCode})`,
        },
      ],
    },
  };
};

exports.up = async function (db) {
  const permissionGroupId = (await findSingleRecord(db, 'permission_group', { name: 'Public' })).id;
  await insertObject(db, 'report', {
    ...report,
    id: generateId(),
    permission_group_id: permissionGroupId,
  });
  await updateValues(
    db,
    'mapOverlay',
    { measureBuilder: 'reportServer', measureBuilderConfig: { reportCode: report.code } },
    { id: 'AU_FLUTRACKING_LGA_Fever_And_Cough' },
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
