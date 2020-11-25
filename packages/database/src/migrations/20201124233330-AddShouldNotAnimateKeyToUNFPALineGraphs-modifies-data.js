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
/**
 * At time of writing, this affects the following reports:
 * UNFPA_Monthly_3_Methods_of_Contraception
 * UNFPA_Monthly_5_Methods_of_Contraception_Regional
 * UNFPA_Facilities_Offering_Delivery
 * UNFPA_Facilities_Offering_Services
 * UNFPA_Reproductive_Health_Product_MOS
 * UNFPA_Delivery_Services_Stock
 * UNFPA_Monthly_5_Methods_of_Contraception
 * UNFPA_Monthly_3_Methods_of_Contraception_Regional
 * UNFPA_Region_Percentage_Facilities_Offering_Services_ANC
 * UNFPA_Region_Facilities_Offering_Services_At_Least_1_Delivery_SGBV
 * UNFPA_Region_Facilities_Offering_Services_At_Least_1_Family_Planning
 * UNFPA_Region_Facilities_Offering_Services_At_Least_1_Delivery
 * UNFPA_Reproductive_Health_Product_MOS_National
 * UNFPA_Percentage_Of_Facilities_At_Least_1_Staff_Trained_SRH_Services
 * UNFPA_Region_Percentage_Facilities_Offering_Services_Delivery
 * UNFPA_Region_Percentage_Facilities_Offering_Services_Family_Planning
 * UNFPA_Region_Percentage_Facilities_Offering_Services_PNC
 * UNFPA_RH_Products_MOS
 * UNFPA_Reproductive_Health_Product_AMC
 */
exports.up = function (db) {
  return db.runSql(`
    update "dashboardReport"
    set "viewJson" = "viewJson" || '{"shouldNotAnimate": true}'
    where id like 'UNFPA%'
    and "viewJson" ->> 'chartType' = 'line';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "dashboardReport"
    set "viewJson" = "viewJson" - 'shouldNotAnimate'
    where id like 'UNFPA%'
    and "viewJson" ->> 'chartType' = 'line';
  `);
};

exports._meta = {
  version: 1,
};
