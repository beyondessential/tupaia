'use strict';

import {} from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};
const OLD_CONFIG = {
  rows: ['Delivery', 'ANC', 'PNC', 'Number of Facilities Surveyed'],
  cells: [
    [
      {
        calc: 'SUM',
        dataElement: 'RHS3UNFPA644',
      },
    ],
    [
      {
        calc: 'SUM',
        dataElement: 'RHS3UNFPA633',
      },
    ],
    [
      {
        calc: 'SUM',
        dataElement: 'RHS3UNFPA636',
      },
    ],
    [
      {
        calc: 'COUNT_ENTITIES_IN_ANALYTICS',
        dataElement: 'NONE',
      },
    ],
  ],
};

const NEW_CONFIG = {
  rows: ['Delivery', 'ANC', 'PNC', 'Family Planning', 'Number of Facilities Surveyed'],
  cells: [
    [
      {
        calc: 'SUM',
        dataElement: 'RHS3UNFPA644',
      },
    ],
    [
      {
        calc: 'SUM',
        dataElement: 'RHS3UNFPA633',
      },
    ],
    [
      {
        calc: 'SUM',
        dataElement: 'RHS3UNFPA636',
      },
    ],
    [
      {
        calc: 'SUM',
        dataElement: 'RHS4UNFPA878',
      },
    ],
    [
      {
        calc: 'COUNT_ENTITIES_IN_ANALYTICS',
        dataElement: 'NONE',
      },
    ],
  ],
};
exports.up = function(db) {
  return db.runSql(`
    update "dashboardReport"
    set
      "dataBuilderConfig" = jsonb_set(
          jsonb_set("dataBuilderConfig", '{cells}', '${JSON.stringify(NEW_CONFIG.cells)}'),
          '{rows}',
          '${JSON.stringify(NEW_CONFIG.rows)}'
        )
    where id = 'UNFPA_RH_Number_Of_Women_Provided_SRH_Services_Matrix_National_Provincial';
  `);
};

exports.down = function(db) {
  return db.runSql(`
  update "dashboardReport"
  set
    "dataBuilderConfig" = jsonb_set(
        jsonb_set("dataBuilderConfig", '{cells}', '${JSON.stringify(OLD_CONFIG.cells)}'),
        '{rows}',
        '${JSON.stringify(OLD_CONFIG.rows)}'
      )
  where id = 'UNFPA_RH_Number_Of_Women_Provided_SRH_Services_Matrix_National_Provincial';
`);
};

exports._meta = {
  version: 1,
};
