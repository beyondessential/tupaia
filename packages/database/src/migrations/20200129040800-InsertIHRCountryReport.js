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

exports.up = function (db) {
  return db.runSql(`
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
      VALUES (
        'WHO_IHR_SPAR_WPRO',
        'tableOfValuesForOrgUnits',
        '{"rows": [{"rows": ["C.1.1 Legislation, laws, regulations, policy, administrative requirements or other government instruments to implement the IHR (2005)", "C.1.2 Financing for the implementation of IHR capacities", "C.1.3 Financing mechanism and funds for the timely response to public health emergencies"], "category": "Legislation and financing"}, {"rows": ["C.2.1 NFP functions under IHR", "C.2.2 Multi-sectoral IHR coordination mechanisms"], "category": "IHR Coordination"}, {"rows": ["C.3.1 Collaborative effort on activities to address zoonoses"], "category": "Zoonotic events and the human-animal interface"}, {"rows": ["C.4.1 Multisectoral collaboration mechanism for food safety events"], "category": "Food safety"}, {"rows": ["C.5.1 Specimen referral and transport system", "C.5.2 Implementation of a laboratory biosafety and biosecurity regime", "C.5.3 Access to laboratory testing capacity for priority diseases"], "category": "Laboratory"}, {"rows": ["C.6.1 Early warning function : indicator- and event-based surveillance", "C.6.2 Mechanism for event management (verification, risk assessment analysis, investigation)"], "category": "Surveillance"}, {"rows": ["C.7.1 Human resources to implement IHR (2005) capacities"], "category": "Human resources"}, {"rows": ["C.8.1 Planning for emergency preparedness and response mechanism", "C.8.2 Management of health emergency response operation", "C.8.3 Emergency resource mobilization"], "category": "National health emergency framework"}, {"rows": ["C.9.1 Case management capacity for IHR relevant hazards", "C.9.2 Capacity for infection prevention and control (IPC) and chemical and radiation decontamination", "C.9.3 Access to essential health services"], "category": "Health service provision"}, {"rows": ["C.10.1 Capacity for emergency risk communications"], "category": "Risk communication"}, {"rows": ["C.11.1 Core capacity requirements at all times for designated airports, ports and ground crossings", "C.11.2 Effective public health response at points of entry"], "category": "Points of entry"}, {"rows": ["C.12.1 Resources for detection and alert"], "category": "Chemical events"}, {"rows": ["C.13.1 Capacity and resources"], "category": "Radiation emergencies"}], "cells": [["SPAR002"], ["SPAR003"], ["SPAR004"], ["SPAR005A"], ["SPAR006"], ["SPAR008"], ["SPAR010"], ["SPAR011A"], ["SPAR011B"], ["SPAR012"], ["SPAR013A"], ["SPAR014"], ["SPAR016"], ["SPAR017A"], ["SPAR017B"], ["SPAR018"], ["SPAR019A"], ["SPAR019B"], ["SPAR020"], ["SPAR022"], ["SPAR023A"], ["SPAR024"], ["SPAR026"], ["SPAR028"]], "columns": ["CK", "FJ", "KI", "MH", "FM", "NR", "NU", "PW", "PG", "WS", "SB", "TO", "TV", "VU"], "categoryAggregator": "$average", "stripFromDataElementNames": "SPAR: "}',
        '{"name": "SPAR (WPRO Countries)", "type": "matrix", "placeholder": "/static/media/PEHSMatrixPlaceholder.png", "categoryPresentationOptions": {"red": {"max": 20, "min": 0, "color": "#b71c1c", "label": "red", "description": "Averaged score:"}, "green": {"max": 100, "min": 70, "color": "#33691e", "label": "green", "description": "Averaged score:"}, "yellow": {"max": 69, "min": 21, "color": "#fdd835", "label": "yellow", "description": "Averaged score:"}}}'
      );
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE "id" = 'WHO_IHR_Reports';
  `);
};

exports._meta = {
  version: 1,
};
