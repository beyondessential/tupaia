'use strict';

import { arrayToDbString, insertObject } from '../utilities/migration';

var dbm;
var type;
var seed;

const report = {
  id: 'FETP_PG_graduate_by_district',
  dataBuilder: 'countIndividualsByDistrict',
  dataBuilderConfig: {
    columns: ['Number of FETP Grads'],
  },
  viewJson: {
    name: 'Number of FETP Graduates by District',
    type: 'matrix',
    placeholder: '/static/media/PEHSMatrixPlaceholder.png',
  },
  dataServices: [{ isDataRegional: true }],
};
const dashboardGroups = ['PG_FETP_Country_Public', 'PG_FETP_District_Public'];

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', report);

  return db.runSql(`
    update "dashboardGroup" 
    set "dashboardReports" = "dashboardReports" || '{${report.id}}' 
    where code in (${arrayToDbString(dashboardGroups)});
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "dashboardGroup" 
    set "dashboardReports" = array_remove("dashboardReports", '${report.id}')
    where code in (${arrayToDbString(dashboardGroups)});

    delete from "dashboardReport" where id = '${report.id}';
  `);
};
