'use strict';

import { arrayToDbString } from '../utilities';

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

const OLD_DATA_SERVICES = [{ isDataRegional: false }];
const NEW_DATA_SERVICES = [{ isDataRegional: true }];

const NEW_GENDER_REPORT_NAME = 'Number of Students by Gender';
const OLD_GENDER_REPORT_NAME = 'Male/Female';

const REPORT_IDS = ['Laos_Schools_Male_Female', 'Laos_Schools_Language_Of_Students'];

exports.up = async function (db) {
  await db.runSql(`
    update "dashboardReport"
    set "dataServices" = '${JSON.stringify(NEW_DATA_SERVICES)}'
    where id in (${arrayToDbString(REPORT_IDS)});

    update "dashboardReport"
    set "viewJson" = jsonb_set("viewJson", '{name}', '"${NEW_GENDER_REPORT_NAME}"')
    where id = 'Laos_Schools_Male_Female';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    update "dashboardReport"
    set "dataServices" = '${JSON.stringify(OLD_DATA_SERVICES)}'
    where id in (${arrayToDbString(REPORT_IDS)});

    update "dashboardReport"
    set "viewJson" = jsonb_set("viewJson", '{name}', '"${OLD_GENDER_REPORT_NAME}"')
    where id = 'Laos_Schools_Male_Female';
  `);
};

exports._meta = {
  version: 1,
};
