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

// In these dashboards there was a typo where the same data element code is given for two cells in a row
// This is just a small migration to clean things up
const REPORT_CODES = ['AMC', 'MOS', 'SOH'];
const REPORT_ID_SUFFIX = 'UNFPA_Priority_Medicines_';
const DUPLICATE_CELL_CODE = '47d584bf';
const MISSING_CELL_CODE = '3ff944bf';

const getCellsFromDashboard = async (db, dashboardId) =>
  (
    await db.runSql(
      `SELECT "dataBuilderConfig"->'cells' FROM "dashboardReport" WHERE id = '${dashboardId}'`,
    )
  ).rows[0]['?column?'];
const setCellsForDashboard = async (db, dashboardId, cells) =>
  db.runSql(`
  UPDATE "dashboardReport" 
    SET "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{cells}', '["${cells.join(
      '","',
    )}"]')    
  WHERE id = '${dashboardId}';`);

exports.up = async function (db) {
  await Promise.all(
    REPORT_CODES.map(async code => {
      const dashboardId = REPORT_ID_SUFFIX + code;
      const cells = await getCellsFromDashboard(db, dashboardId);
      let duplicateEncounters = 0;
      const fixedCells = cells.map(cell => {
        if (cell.includes(DUPLICATE_CELL_CODE)) {
          duplicateEncounters++;
          if (duplicateEncounters > 1) {
            return `${code}_${MISSING_CELL_CODE}`;
          }
        }
        return cell;
      });
      await setCellsForDashboard(db, dashboardId, fixedCells);
    }),
  );
  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
