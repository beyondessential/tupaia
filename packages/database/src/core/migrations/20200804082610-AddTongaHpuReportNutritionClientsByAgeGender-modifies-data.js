'use strict';

import { insertObject } from '../utilities/migration';

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

// Dashboard Group | Health Promotion Unit
// Dashboard Title | Nutrition Counselling Clients by Age and Gender, Tonga
// Dashboard type | Bar chart (2 bars - M/F separated)
// x axis = age brackets, y axis = number of participants, category = gender
// Permission Group | Tonga Health Promotion Unit
// Countries | Tonga
// Hierarchy Level | National
// Survey: HP08 Monthly Nutrition Counselling
// Yearly selector please.

// DataElement |  Answer Type |  Description
// Total Number of One on One Participants:
// HP299b Number 10-19 years- male
// HP299c Number 10-19 years- female
// HP300a Number 20-29 years- male
// HP300b Number 20-29 years- female
// HP301a Number 30-39 years- male
// HP301b Number 30-39 years- female
// HP302a_m Number 40-49 years- male
// HP302a_f Number 40-49 years- female
// HP302b_m Number 50-59 years- male
// HP302b_f Number 50-59 years- female
// HP303 Number 60+ male
// HP304 Number 60+ female

// Total Number of Group Participants:
// HP323aa Number 10-19 years- male
// HP323ab Number 10-19 years- female
// HP324a Number 20-29 years- male
// HP324b Number 20-29 years- female
// HP325a Number 30-39 years- male
// HP325b Number 30-39 years- female
// HP326a_m Number 40-49 years- male
// HP326a_f Number 40-49 years- female
// HP326b_m Number 50-59 years- male
// HP326b_f Number 50-59 years- female
// HP327 Number 60+ male
// HP328 Number 60+ female
// Calculations

// HP299b + HP323aa = 10-19 years- male
// HP299c + HP323ab = 10-19 years- female
// HP300a + HP324a = 20-29 years- male
// HP300b + HP324b = 20-29 years- female
// HP301a + HP325a = 30-39 years- male
// HP301b + HP325b = 30-39 years- female
// HP302a_m + HP326a_m = 40-49 years- male
// HP302a_f + HP326a_f = 40-49 years- female
// HP302b_m + HP326b_m = 50-59 years- male
// HP302b_f + HP326b_f = 50-59 years- female
// HP303 + HP327 = 60+ male
// HP304 + HP328 = 60+ female

const dashboardGroups = 'TO_Health_Promotion_Unit_Country';
const reportId = 'TO_HPU_Nutrition_Counselling_Clients_By_Age_Gender';
const dataBuilder = 'sumPerYearPerSeries';
const dataBuilderConfig = {
  series: {
    Male: {
      '10 - 19 years': ['HP299b', 'HP323aa'],
      '20 - 29 years': ['HP300a', 'HP324a'],
      '30 - 39 years': ['HP301a', 'HP325a'],
      '40 - 49 years': ['HP302a_m', 'HP326a_m'],
      '50 - 59 years': ['HP302b_m', 'HP326b_m'],
      '60 + years': ['HP303', 'HP327'],
    },
    Female: {
      '10 - 19 years': ['HP299c', 'HP323ab'],
      '20 - 29 years': ['HP300b', 'HP324b'],
      '30 - 39 years': ['HP301b', 'HP325b'],
      '40 - 49 years': ['HP302a_f', 'HP326a_f'],
      '50 - 59 years': ['HP302b_f', 'HP326b_f'],
      '60 + years': ['HP304', 'HP328'],
    },
  },
  periodType: 'year',
};
const viewJson = {
  name: 'Nutrition Counselling Clients by Age and Gender',
  type: 'chart',
  chartType: 'bar',
  periodGranularity: 'one_year_at_a_time',
  chartConfig: {
    Male: { stackId: 1 },
    Female: { stackId: 2 },
  },
  // defaultTimePeriod: {
  //   unit: 'year',
  //   offset: -1,
  // },
};

const dataServices = [{ isDataRegional: false }];

const report = {
  id: reportId,
  dataBuilder,
  dataBuilderConfig,
  viewJson,
  dataServices,
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', report);

  return db.runSql(`
     UPDATE "dashboardGroup"
     SET "dashboardReports" = "dashboardReports" || '{ ${report.id} }'
     WHERE "code" = '${dashboardGroups}';
   `);
};

exports.down = function (db) {
  return db.runSql(`
     DELETE FROM "dashboardReport" WHERE id = '${report.id}';

     UPDATE "dashboardGroup"
     SET "dashboardReports" = array_remove("dashboardReports", '${report.id}')
     WHERE "code" = '${dashboardGroups}';
   `);
};

exports._meta = {
  version: 1,
};
