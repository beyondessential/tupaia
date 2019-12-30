'use strict';

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

exports.up = function(db) {
  return db.runSql(`
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
    VALUES ('CI_MSR_Total_Implementations', 'dataElementsOverTotalOperational', '{"labels": {"MSUP1037": "Total des implémentations terminées"}, "dataElementCodes": ["MSUP1037"]}', '{"name": "Total des mises en œuvre terminées", "type": "view", "viewType": "singleValue", "valueType": "fraction"}');

    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
    VALUES ('CI_MSR_Total_Computers', 'dataElementsOverTotalOperational', '{"labels": {"MSUP1004": "Total des ordinateurs installés"}, "dataElementCodes": ["MSUP1004"]}', '{"name": "Total des ordinateurs installés", "type": "view", "viewType": "singleValue", "valueType": "fraction"}');

    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
    VALUES ('CI_MSR_Total_Trained_Staff', 'dataElementsOverTotalOperational', '{"labels": {"MSUP1015": "Complété la formation du personnel"}, "dataElementCodes": ["MSUP1015"]}', '{"name": "Deux ou plusieurs membres du personnel formés", "type": "view", "viewType": "singleValue", "valueType": "fraction"}');

    INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code")
    VALUES ('Country', 'Donor', 'CI', '{"CI_MSR_Total_Implementations", "CI_MSR_Total_Trained_Staff", "CI_MSR_Total_Computers"}', 'Déploiement du mSupply', 'CI_mSupply_Implementation_Country');

    INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code")
    VALUES ('Province', 'Donor', 'CI', '{"CI_MSR_Total_Implementations", "CI_MSR_Total_Trained_Staff", "CI_MSR_Total_Computers"}', 'Déploiement du mSupply', 'CI_mSupply_Implementation_Province');



    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
    VALUES ('CI_MSR_Implementation_Complete', 'sumLatestData', '{"dataElementCodes": ["MSUP1037"]}', '{"name": "La mise en œuvre de mSuppy est-elle terminée", "type": "view", "viewType": "singleValue", "valueType": "boolean"}');

    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
    VALUES ('CI_MSR_Computer_Status', 'sumLatestData', '{"dataElementCodes": ["MSUP1004", "MSUP1005", "MSUP1007", "MSUP1012"]}', E'{"name": "Configuration de l\\'ordinateur", "type": "view", "viewType": "multiValue", "valueType": "boolean"}');
    
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
    VALUES ('CI_MSR_Staff_Training', 'sumLatestData', '{"dataElementCodes": ["MSUP1015", "MSUP1020", "MSUP1021", "MSUP1023", "MSUP1024"]}', '{"name": "La formation du personnel", "type": "view", "viewType": "multiValue", "valueType": "boolean"}');
    
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
    VALUES ('CI_MSR_Primary_Contact', 'latestDataValuesInGroup', '{"dataElementGroupCode": "mSupplyPrimaryContact"}', '{"name": "Informations de contact", "type": "view", "viewType": "multiValue"}');

    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
    VALUES ('CI_MSR_Systems_Tested', 'sumLatestData', '{"dataElementCodes": ["MSUP1030", "MSUP1031"]}', '{"name": "Systèmes testés", "type": "view", "viewType": "multiValue", "valueType": "boolean"}');

    INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code")
    VALUES ('Facility', 'Donor', 'CI', '{"CI_MSR_Implementation_Complete", "CI_MSR_Staff_Training", "CI_MSR_Primary_Contact", "CI_MSR_Computer_Status", "CI_MSR_Systems_Tested"}', 'Déploiement du mSupply', 'CI_mSupply_Implementation_Facility');
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
