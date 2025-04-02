'use strict';

import { generateId, insertObject } from '../utilities';
import {
  indicators,
  reportChanges,
  overlayChanges,
} from './migrationData/20200826215113-UseIndicatorsInStriveVisualisations';

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

const insertIndicator = async (db, indicator) => {
  const { code } = indicator;

  await insertObject(db, 'data_source', {
    id: generateId(),
    code,
    type: 'dataElement',
    service_type: 'indicator',
  });
  await insertObject(db, 'indicator', { id: generateId(), ...indicator });
};

const deleteIndicator = async (db, indicator) => {
  const { code } = indicator;
  await db.runSql(
    `DELETE FROM data_source WHERE code = '${code}';
    DELETE FROM indicator WHERE code = '${code}';
  `,
  );
};

const updateReport = (db, { id, fields }) =>
  db.runSql(`
    UPDATE "dashboardReport"
    SET
      "dataBuilder" = '${fields.dataBuilder}',
      "dataBuilderConfig" = '${JSON.stringify(fields.dataBuilderConfig)}'
    WHERE id = '${id}';`);

const updateOverlay = (db, { id, fields }) =>
  db.runSql(`
    UPDATE "mapOverlay"
    SET
      "dataElementCode" = '${fields.dataElementCode}',
      "measureBuilder" = '${fields.measureBuilder}',
      "measureBuilderConfig" = '${JSON.stringify(fields.measureBuilderConfig)}'
    WHERE id = '${id}';`);

const processIndicators = async (db, callback) =>
  Promise.all(Object.values(indicators).map(async indicator => callback(db, indicator)));

/**
 * @param {('new'|'old')} fieldsKey Specify the fields to use for the update
 */
const updateVisualisations = async (db, fieldsKey) => {
  await Promise.all(
    reportChanges.map(async change =>
      updateReport(db, { id: change.id, fields: change[fieldsKey] }),
    ),
  );
  await Promise.all(
    overlayChanges.map(async change =>
      updateOverlay(db, { id: change.id, fields: change[fieldsKey] }),
    ),
  );
};

exports.up = async function (db) {
  await processIndicators(db, insertIndicator);
  await updateVisualisations(db, 'new');
};

exports.down = async function (db) {
  await processIndicators(db, deleteIndicator);
  await updateVisualisations(db, 'old');
};

exports._meta = {
  version: 1,
};
