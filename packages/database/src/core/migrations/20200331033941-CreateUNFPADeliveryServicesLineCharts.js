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

const createDataClass = dataElement => {
  return {
    numerator: {
      groupBy: 'organisationUnit',
      operation: 'GT',
      operand: 0,
      dataValues: [dataElement],
    },
    denominator: { dataValues: ['RHS3UNFPA536'], valueOfInterest: 1 },
  };
};

const dataBuilderConfig = {
  dataClasses: {
    'Oxytocin 10IU/1mL injection': createDataClass('SOH_555c04bf'),
    'Oxytocin 5IU Ampoules': createDataClass('SOH_4790d43e'),
    'Magnesium (sulfate) 0.5g/mL (2mL) equivalent to 1g/2mL; 50%w/v': createDataClass(
      'SOH_51b474bf',
    ),
    'Magnesium (sulfate) 0.5g/mL (10mL) equivalent to 5g/10mL; 50%w/v': createDataClass(
      'SOH_51ce64bf',
    ),
    'Ferrous salt equivalent to 60mg tablet': createDataClass('SOH_41e9d4bf'),
    'Ferrous salt equivalent to 60mg iron tablet and folic acid 400mcg tablet': createDataClass(
      'SOH_41f354bf',
    ),
    'Mebendazole 100mg tablet (chewable)': createDataClass('SOH_484444bf'),
    'Mebendazole 500mg tablet (chewable)': createDataClass('SOH_484d54bf'),
  },
  periodType: 'month',
};

const viewConfig = {
  name: '% of Facilities (offering Delivery Services) with Maternal Health Products Available',
  type: 'chart',
  chartType: 'line',
  labelType: 'fractionAndPercentage',
  valueType: 'percentage',
  chartConfig: {
    'Oxytocin 10IU/1mL injection': {},
    'Oxytocin 5IU Ampoules': {},
    'Magnesium (sulfate) 0.5g/mL (2mL) equivalent to 1g/2mL; 50%w/v': {},
    'Magnesium (sulfate) 0.5g/mL (10mL) equivalent to 5g/10mL; 50%w/v': {},
    'Ferrous salt equivalent to 60mg tablet': {},
    'Ferrous salt equivalent to 60mg iron tablet and folic acid 400mcg tablet': {},
    'Mebendazole 100mg tablet (chewable)': {},
    'Mebendazole 500mg tablet (chewable)': {},
  },
  periodGranularity: 'month',
  ticks: [0, 0.25, 0.5, 0.75, 1],
};

exports.up = async function (db) {
  await db.runSql(`
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
    VALUES (
      'UNFPA_Delivery_Services_Stock',
      'percentagesOfValueCountsPerPeriod',
      '${JSON.stringify(dataBuilderConfig)}',
      '${JSON.stringify(viewConfig)}'
    );
  `);

  return db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{UNFPA_Delivery_Services_Stock}'
    WHERE "name" = 'UNFPA' AND "organisationLevel" IN ('Country', 'Province');
  `);
};

exports.down = function (db) {
  db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = '{UNFPA_Monthly_3_Methods_of_Contraception,UNFPA_Monthly_5_Methods_of_Contraception,UNFPA_Facilities_Offering_Services,UNFPA_Facilities_Offering_Delivery,UNFPA_RH_Stock_Cards}'
    WHERE "name" = 'UNFPA' AND "organisationLevel" IN ('Country', 'Province');

    DELETE FROM "dashboardReport" WHERE id = 'UNFPA_Delivery_Services_Stock';
  `);
};

exports._meta = {
  version: 1,
};
