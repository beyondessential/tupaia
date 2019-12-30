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

exports.up = function(db, callback) {
  const rejectOnError = (resolve, reject, error) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  };
  Promise.all([
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '2',
          'totalStockValue',
          `{
    "type": "view",
    "name": "Total Value of Current Stock at this Facility (Local Currency)",
    "viewType": "singleValue",
    "valueType": "currency",
    "source": "mSupply"
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "TVSH" ],
    "outputIdScheme": "code"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '3',
          'totalStockValue',
          `{
    "type": "view",
    "name": "Total Value of Current Stock at National Warehouse (Local Currency)",
    "viewType": "singleValue",
    "valueType": "currency",
    "source": "mSupply"
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "TVSH" ],
    "outputIdScheme": "code"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '4',
          'latestMultiDataElement',
          `{
    "type": "view",
    "name": "Cold Chain",
    "viewType": "multiValue",
    "valueType": "boolean"
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "BCD25", "BCD26", "BCD27" ]
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '5',
          'latestDataValueDate',
          `{
    "type": "view",
    "name": "Date Last Assessed",
    "viewType": "multiSingleValue"
  }`,
          `{
    "apiRoute": "dataValueSets",
    "dataSetCode": "SDSet"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '6',
          'latestMultiDataElement',
          `{
    "type": "chart",
    "name": "% Stock on Hand",
    "chartType": "pie",
    "valueType": "percentage",
    "source": "mSupply"
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "PVSH1", "PVSH3", "PVSH2", "PVSH4" ]
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '7',
          'percentInGroupByDataElement',
          `{
    "type": "chart",
    "name": "% Stock on Hand across Operational mSupply© Facilities",
    "chartType": "pie",
    "valueType": "percentage",
    "source": "mSupply"
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "PVSH1", "PVSH3", "PVSH2", "PVSH4" ],
    "organisationUnitIsGroup":true
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '8',
          'latestMultiDataElement',
          `{
    "type": "chart",
    "name": "Number of Healthcare Workers",
    "chartType": "pie",
    "valueType": "text"
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "BCD46", "BCD47", "BCD48", "BCD49", "BCD50-55" ]
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '9',
          'latestMultiDataElement',
          `{
    "type": "view",
    "name": "Availability of Critical Medicines",
    "viewType": "singleValue",
    "valueType": "percentage"
    }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "PercentageCriticalMedicinesAvailable" ],
    "aggregationType": "AVERAGE"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '10',
          'percentInGroupByDataElement',
          `{
    "type": "view",
    "name": "Average Availability of Medicines across Operational Facilities",
    "viewType": "singleValue",
    "valueType": "percentage",
    "description": "Average % availability of critical medicines from every operational facility, based on latest data from each site. Takes an average from every operational facility, regardless of when the latest data is available from each facility."
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "PercentageCriticalMedicinesAvailable" ],
    "organisationUnitIsGroup":true
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '11',
          'monthlyDataValues',
          `{
    "type": "chart",
    "name": "% Availability of Medicines by Month",
    "xName": "Month",
    "yName": "%",
    "chartType": "line",
    "valueType": "percentage"
    }`,
          `{
    "apiRoute": "analytics",
    "singleFacility": true,
    "dataElementCodes": [ "PercentageCriticalMedicinesAvailable" ],
    "period": "LAST_12_MONTHS;THIS_MONTH",
    "aggregationType": "AVERAGE"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '12',
          'monthlyDataValues',
          `{
    "type": "chart",
    "name": "% Availability of Medicines from Facilities Surveyed Each Month",
    "xName": "Month",
    "yName": "%",
    "chartType": "line",
    "valueType": "percentage",
    "description": "Average % availability of critical medicines from every operational facility surveyed each month. Each data point on the graph only counts facilities from where data is available from the preceding month."
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "PercentageCriticalMedicinesAvailable" ],
    "period": "LAST_12_MONTHS;THIS_MONTH",
    "organisationUnitIsGroup":true,
    "aggregationType": "AVERAGE"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '13',
          'percentInGroupByFacility',
          `{
    "type": "chart",
    "name": "Medicines Availability by Clinic",
    "xName": "Clinic",
    "yName": "%",
    "chartType": "bar",
    "valueType": "percentage"
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "PercentageCriticalMedicinesAvailable" ],
    "organisationUnitIsGroup":true,
    "aggregationType": "AVERAGE"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '14',
          'percentInGroupByDataElement',
          `{
    "type": "view",
    "name": "% of Operational Facilities with Working Fridges",
    "viewType": "singleValue",
    "valueType": "percentage"
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "BCD25" ],
    "organisationUnitIsGroup":true
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '15',
          'percentageInGroup',
          `{
    "type": "view",
    "name": "% of Operational Facilities Surveyed in the Last 6 Months",
    "viewType": "singleValue",
    "valueType": "percentage"
  }`,
          `{
    "apiRoute": "sqlViews",
    "sqlViewId": "RZaDib3dqn3",
    "variables": {
      "dataElementCode": "BCDSurveyDate",
      "fromDate": "{nowMinusSixMonths}",
      "organisationUnitCode": "{organisationUnitCode}"
    }
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '16',
          'latestMultiDataElement',
          `{
    "type": "chart",
    "name": "Current Stock on Hand",
    "chartType": "pie",
    "valueType": "percentage"
  }`,
          `{
      "apiRoute": "analytics",
      "dataElementCodes": [ "PercentageCriticalMedicinesAvailable", "PercentageCriticalMedicinesOutOfStock", "PercentageCriticalMedicinesExpired" ],
      "aggregationType": "AVERAGE"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '17',
          'percentInGroupByDataElement',
          `{
    "type": "chart",
    "name": "Current Stock on Hand across Operational Facilities",
    "chartType": "pie",
    "valueType": "percentage"
  }`,
          `{
      "apiRoute": "analytics",
      "dataElementCodes": [ "PercentageCriticalMedicinesAvailable", "PercentageCriticalMedicinesOutOfStock", "PercentageCriticalMedicinesExpired" ],
      "organisationUnitIsGroup":true,
      "aggregationType": "AVERAGE"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '18',
          'latestMultiDataElement',
          `{
    "type": "view",
    "name": "Service Offered",
    "viewType": "multiValue",
    "valueType": "boolean"
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "SS162", "SS128", "SS182", "SS190", "SS192", "SS219", "DP9" ],
    "aggregationType": "SUM"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '19',
          'dataElementsOverTotalOperational',
          `{
    "type": "view",
    "name": "Number of Facilities Offering",
    "viewType": "multiValue",
    "valueType": "fraction"
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "SS162", "SS128", "SS182", "SS190", "SS192", "SS219", "DP9" ],
    "organisationUnitIsGroup":true,
    "aggregationType": "SUM"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '20',
          'percentChildrenDataElement',
          `{
    "type": "chart",
    "name": "% of Clinics That Have These Items",
    "xName": "items",
    "yName": "%",
    "chartType": "bar",
    "valueType": "percentage"
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "DE_GROUP-FMI" ],
    "organisationUnitIsGroup":true,
    "aggregationType": "AVERAGE"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '21',
          'frequencyDataElement',
          `{
    "type": "view",
    "name": "Frequency of Vaccination",
    "viewType": "multiValue",
    "valueType": "text",
    "noDataMessage": "No vaccination services"
  }`,
          `{
      "apiRoute": "analytics",
      "dataElementCodes": [ "SS162", "SS163" ]
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '22',
          'basicDataFacility',
          `{
    "type": "view",
    "name": "Basic Clinic Data",
    "viewType": "multiValue",
    "valueType": "text"
  }`,
          `{
        "apiRoute": "analytics",
      "dataElementCodes": [ "BCD39", "BCD41", "BCD43", "FF7", "BCD46", "BCD47", "BCD48", "BCD49", "BCD50-55" ]
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '23',
          'countOperationalFacilitiesByType',
          `{
    "type": "view",
    "name": "Number of Operational Facilities by Type",
    "viewType": "multiValue",
    "valueType": "text"
  }`,
          `{}`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '24',
          'dataElementsOverTotalOperational',
          `{
    "type": "view",
    "name": "Number of Facilities with a Midwife",
    "viewType": "singleValue",
    "valueType": "text"
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "BCD47" ],
    "organisationUnitIsGroup":true
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '25',
          'countDataElement10kPax',
          `{
    "type": "view",
    "name": "# of Doctors, Nurses and Facilities per 10k People",
    "viewType": "multiValue",
    "valueType": "text"
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "POPULATION", "BCD46", "BCD48" ]
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '26',
          'countOperationalFacilities',
          `{
    "type": "view",
    "name": "Number of Operational Facilities",
    "viewType": "singleValue",
    "valueType": "fraction"
  }`,
          `{}`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '27',
          'percentChildrenDataElement',
          `{
    "type": "view",
    "name": "% Based on Facility Surveys",
    "viewType": "multiValue",
    "valueType": "percentage"
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "BCD25", "BCD31", "BCD32", "BDC10-13-19" ],
    "organisationUnitIsGroup":true,
    "aggregationType": "AVERAGE"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '28',
          'countOperationalFacilitiesByCountry',
          `{
    "type": "chart",
    "name": "Number of Operational Facilities Surveyed by Country",
    "chartType": "pie",
    "valueType": "text"
  }`,
          `{}`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '29',
          'percentInGroupByFacility',
          `{
    "type": "chart",
    "name": "Medicines Availability by Country",
    "xName": "Country",
    "yName": "%",
    "chartType": "bar",
    "valueType": "percentage"
  }`,
          `{
    "apiRoute": "analytics",
    "countries": "true",
    "dataElementCodes": [ "PercentageCriticalMedicinesAvailable" ],
    "organisationUnitIsGroup":true
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '30',
          'latestMultiDataElement',
          `{
    "type": "view",
    "name": "Service Offered",
    "viewType": "multiValue",
    "valueType": "boolean"
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "DP1A", "DP17", "DP18", "DP67", "DP71_Reverse", "DP74A_Reverse" ],
    "aggregationType": "SUM"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '31',
          'latestDataValueDate',
          `{
    "//": "This view is for Disaster Preparedness",
    "type": "view",
    "name": "Date Last Assessed",
    "viewType": "multiSingleValue",
    "surveyCode": "DP"
  }`,
          `{
    "apiRoute": "dataValueSets",
    "dataElementGroupCode": "DPSurveyDate"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '32',
          'multiDataValuesLatestSurvey',
          `{
    "type": "view",
    "name": "Post-Disaster Photos of the Facility",
    "viewType": "multiPhotograph",
    "surveyDataElementCode": "DPSurveyDate"
  }`,
          `{
    "apiRoute": "dataValueSets",
    "dataElementGroupCode": "DPR_Photos"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '34',
          'latestMultiDataElement',
          `{
    "type": "view",
    "name": "Phone Number and Number of Operational Beds",
    "viewType": "multiSingleValue",
    "valueType": "text"
    }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "BCD14", "DP9" ]
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '35',
          'multiDataValuesLatestSurvey',
          `{
    "type": "view",
    "name": "Water and Electricity Damage",
    "viewType": "multiSingleValue",
    "valueType": "text",
    "surveyDataElementCode": "DPSurveyDate"
    }`,
          `{
    "apiRoute": "dataValueSets",
    "dataElementGroupCode": "DP_WE_Damage"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '51',
          'latestDataValueDate',
          `{
    "//": "This view is for PEHS",
    "type": "view",
    "name": "Date Last Assessed",
    "viewType": "multiSingleValue",
    "surveyCode": "PEHS"
  }`,
          `{
    "apiRoute": "dataValueSets",
    "dataElementGroupCode": "PEHSSurveyDate"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '52',
          'latestDataValueDate',
          `{
    "//": "This view is for PEHS, for use at country level",
    "type": "view",
    "name": "Date Last Facility Assessed",
    "viewType": "multiSingleValue",
    "surveyCode": "PEHS"
  }`,
          `{
    "apiRoute": "dataValueSets",
    "dataElementGroupCode": "PEHSSurveyDate",
    "organisationUnitIsGroup":true
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '36',
          'percentPerValuePerOrgUnit',
          `{
    "type": "chart",
    "name": "Service Status By Facility",
    "xName": "Facility",
    "yName": "%",
    "chartType": "bar",
    "valueType": "percentage",
    "presentationOptions": {
      "1": {
        "color": "#279A63", "label": "Green"
      },
      "2": {
        "color": "#EE9A30", "label": "Orange"
      },
      "3": {
        "color": "#EE4230", "label": "Red"
      }
    }
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "DE_GROUP-PEHSS" ],
    "organisationUnitIsGroup":true,
    "aggregationType": "ALL"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '37',
          'matrixOrganisationUnitDataElement',
          `{
    "type": "chart",
    "chartType": "matrix",
    "name": "Service Status By Facility",
    "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
    "dataElementColumnTitle" : "Services",
    "presentationOptions": {
      "white": {
        "color": "#333333", "label": "",
        "description": "An **Empty Box** means that the intervention is not available at that level of facility and that it is not a priority to make it available. (For example, there are obviously no plans to perform surgery at a Level 3 facility).\\n"
      },
      "green": {
        "color": "#279A63", "label": "",
        "description": "**Green** signifies that these interventions are able to be routinely provided at this facility.\\n"
      },
      "orange": {
        "color": "#EE9A30", "label": "",
        "description": "**Orange** signifies that these interventions are currently provided in part, but more work needs to be done to ensure consistent availability of the service. This is about the universality and quality of UHC.\\n"
      },
      "red": {
        "color": "#EE4230", "label": "",
        "description": "**Red** signifies that the intervention is not currently provided at this facility level, however it is a priority to provide this within the next 7 years as part of UHC.\\n"
      }
    },
    "//": "Group of all data elements in query, required name and code mapping of result dataElements",
    "dataElementGroup": "PEHSS",
    "//": "Set of data element groups to use for categories mapping",
    "dataElementGroupSet": "PEHS_Service_Categories",
    "//": "For translating from 0-4 value to white-red",
    "optionSetCode": "white.green.orange.red"
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "DE_GROUP-PEHSS" ],
    "organisationUnitIsGroup":true
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '38',
          'countByDataValue',
          `{
    "type": "chart",
    "name": "Service Status Count",
    "chartType": "pie",
    "valueType": "percentage",
    "presentationOptions": {
      "1": {
        "color": "#279A63", "label": "Green"
      },
      "2": {
        "color": "#EE9A30", "label": "Orange"
      },
      "3": {
        "color": "#EE4230", "label": "Red"
      }
    }
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "DE_GROUP-PEHSS" ],
    "organisationUnitIsGroup":true,
    "outputIdScheme": "code"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '39',
          'countByDataValue',
          `{
    "type": "chart",
    "name": "Service Status Count",
    "chartType": "pie",
    "valueType": "percentage",
    "drillDown": { "keyLink": "name", "parameterLink": "serviceStatus" },
    "presentationOptions": {
      "1": {
        "color": "#279A63", "label": "Green"
      },
      "2": {
        "color": "#EE9A30", "label": "Orange"
      },
      "3": {
        "color": "#EE4230", "label": "Red"
      }
    }
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "DE_GROUP-PEHSS" ],
    "aggregationType": "ALL"
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'drillDownLevel', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '39',
          1,
          'latestMultiDataElement',
          `{
    "type": "view",
    "viewType": "colorList",
    "name": "Service List",
    "presentationOptions": {
      "1": {
        "color": "#279A63", "label": "Green"
      },
      "2": {
        "color": "#EE9A30", "label": "Orange"
      },
      "3": {
        "color": "#EE4230", "label": "Red"
      }
    },
    "drillDown": { "keyLink": "code", "parameterLink": "dataElementUID" }
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "DE_GROUP-PEHSS" ],
    "aggregationType": "AVERAGE",
    "measureCriteria": { "EQ": "{serviceStatus}" }
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'drillDownLevel', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '39',
          2,
          'listDataElementNames',
          `{
    "type": "view",
    "viewType": "list",
    "name": "Service Suggestions",
    "valueTranslationOptions": { "match": "^(.*): *", "replace": "" },
    "useValueIfNameMatches": ".*Please provide more details"
  }`,
          `{
    "apiRoute": "sqlViews",
    "sqlViewId": "Jh5GNQyMCeG",
    "variables": {
      "dataElementUID": "{dataElementUID}",
      "organisationUnitCode": "{organisationUnitCode}",
      "lastUpdatedDuration": "600d"
    }
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '40',
          'countValuesByDataElementGroup',
          `{
    "type": "chart",
    "name": "Suggestions",
    "xName": "Suggestion",
    "yName": "Count",
    "chartType": "pie",
    "dataElementGroupSet": "PEHS_Suggestion_Types",
    "presentationOptions": {
      "PEHS Suggestion: Equipment": {
        "label": "Equipment"
      },
      "PEHS Suggestion: Staff Training": {
        "label": "Staff Training"
      },
      "PEHS Suggestion: Medicines or consumables": {
        "label": "Medicines or consumables"
      },
      "PEHS Suggestion: Staff Numbers": {
        "label": "Staff Numbers"
      },
      "PEHS Suggestion: Infrastructure": {
        "label": "Infrastructure"
      }
    }
  }`,
          `{}`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson'],
        [
          '41',
          'matrixOrganisationUnitDataElement',
          `{
    "type": "chart",
    "chartType": "matrix",
    "name": "Service Status Of Facility",
    "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
    "dataElementColumnTitle" : "Services",
    "presentationOptions": {
      "white": {
        "color": "#333333", "label": "",
        "description": "An **Empty Box** means that the intervention is not available at that level of facility and that it is not a priority to make it available. (For example, there are obviously no plans to perform surgery at a Level 3 facility).\\n"
      },
      "green": {
        "color": "#279A63", "label": "",
        "description": "**Green** signifies that these interventions are routinely provided at this facility.\\n"
      },
      "orange": {
        "color": "#EE9A30", "label": "",
        "description": "**Orange** signifies that these interventions are currently provided in part, but more work needs to be done to ensure consistent availability of the service. This is about the universality and quality of UHC.\\n"
      },
      "red": {
        "color": "#EE4230", "label": "",
        "description": "**Red** signifies that the intervention is not currently provided at this facility level, however it is a priority to provide this within the next 7 years as part of UHC.\\n"
      }
    },
    "//": "Group of all data elements in query, required name and code mapping of result dataElements",
    "dataElementGroup": "PEHSS",
    "//": "Set of data element groups to use for categories mapping",
    "dataElementGroupSet": "PEHS_Service_Categories",
    "//": "For translating from 0-4 value to white-red",
    "optionSetCode": "white.green.orange.red"
  }`,
          `{
    "apiRoute": "analytics",
    "dataElementCodes": [ "DE_GROUP-PEHSS" ]
  }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
  ]).then(() => callback());
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
