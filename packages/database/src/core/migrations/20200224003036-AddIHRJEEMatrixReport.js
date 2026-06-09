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
      'WHO_IHR_JEE_WPRO',
      'tableOfValuesForOrgUnits',
      '{
        "cells" : [
          ["JEE002"],
          ["JEE003"],
          ["JEE005"],
          ["JEE007"],
          ["JEE008"],
          ["JEE009"],
          ["JEE010"],
          ["JEE012"],
          ["JEE013"],
          ["JEE014"],
          ["JEE016"],
          ["JEE018"],
          ["JEE019"],
          ["JEE021"],
          ["JEE022"],
          ["JEE024"],
          ["JEE025"],
          ["JEE026"],
          ["JEE027"],
          ["JEE029"],
          ["JEE030"],
          ["JEE031"],
          ["JEE032"],
          ["JEE034"],
          ["JEE035"],
          ["JEE037"],
          ["JEE038"],
          ["JEE039"],
          ["JEE041"],
          ["JEE042"],
          ["JEE044"],
          ["JEE045"],
          ["JEE046"],
          ["JEE047"],
          ["JEE049"],
          ["JEE051"],
          ["JEE052"],
          ["JEE054"],
          ["JEE055"],
          ["JEE056"],
          ["JEE057"],
          ["JEE058"],
          ["JEE060"],
          ["JEE061"],
          ["JEE063"],
          ["JEE064"],
          ["JEE066"],
          ["JEE067"]
        ],
        "rows" : [
          {
            "rows" : [
              "P.1.1 Legislation, laws, regulations, administrative requirements, policies or other government instruments in place are sufficient for implementation of IHR (2005)",
              "P.1.2 The State can demonstrate that it has adjusted and aligned its domestic legislation, policies and administrative arrangements to enable compliance with IHR (2005)"
            ],
            "category" : "National legislation, policy and financing"
          },
          {
            "rows" : [
              "P.2.1 A functional mechanism is established for the coordination and integration of relevant sectors in the implementation of IHR"
            ],
            "category" : "IHR coordination, communication and advocacy"
          },
          {
            "rows" : [
              "P.3.1 Antimicrobial resistance detection",
              "P.3.2 Surveillance of infections caused by antimicrobial-resistant pathogens",
              "P.3.3 Health care-associated infection (HCAI) prevention and control programmes",
              "P.3.4 Antimicrobial stewardship activities"
            ],
            "category" : "Antimicrobial resistance"
          },
          {
            "rows" : [
              "P.4.1 Surveillance systems in place for priority zoonotic diseases/pathogens",
              "P.4.2 Veterinary or animal health workforce",
              "P.4.3 Mechanisms for responding to infectious and potential zoonotic diseases are established and functional"
            ],
            "category" : "Zoonotic diseases"
          },
          {
            "rows" : [
              "P.5.1 Mechanisms for multisectoral collaboration are established to ensure rapid response to food safety emergencies and outbreaks of foodborne diseases"
            ],
            "category" : "Food safety"
          },
          {
            "rows" : [
              "P.6.1 Whole-of-government biosafety and biosecurity system is in place for human, animal and agriculture facilities",
              "P.6.2 Biosafety and biosecurity training and practices"
            ],
            "category" : "Biosafety and biosecurity"
          },
          {
            "rows" : [
              "P.7.1 Vaccine coverage (measles) as part of national programme",
              "P.7.2 National vaccine access and delivery"
            ],
            "category" : "Immunization"
          },
          {
            "rows" : [
              "D.1.1 Laboratory testing for detection of priority diseases",
              "D.1.2 Specimen referral and transport system",
              "D.1.3 Effective modern point-of-care and laboratory-based diagnostics",
              "D.1.4 Laboratory quality system"
            ],
            "category" : "National laboratory system"
          },
          {
            "rows" : [
              "D.2.1 Indicator- and event-based surveillance systems",
              "D.2.2 Interoperable, interconnected, electronic real-time reporting system",
              "D.2.3 Integration and analysis of surveillance data",
              "D.2.4 Syndromic surveillance systems"
            ],
            "category" : "Real-time surveillance"
          },
          {
            "rows" : [
              "D.3.1 System for efficient reporting to FAO, OIE and WHO",
              "D.3.2 Reporting network and protocols in country"
            ],
            "category" : "Reporting"
          },
          {
            "rows" : [
              "D.4.1 Human resources available to implement IHR core capacity requirements",
              "D.4.2 FETP1 or other applied epidemiology training programme in place",
              "D.4.3 Workforce strategy"
            ],
            "category" : "Workforce development"
          },
          {
            "rows" : [
              "R.1.1 National multi-hazard public health emergency preparedness and response plan is developed and implemented",
              "R.1.2 Priority public health risks and resources are mapped and utilized"
            ],
            "category" : "Preparedness"
          },
          {
            "rows" : [
              "R.2.1 Capacity to activate emergency operations",
              "R.2.2 EOC operating procedures and plans",
              "R.2.3 Emergency operations programme",
              "R.2.4 Case management procedures implemented for IHR relevant hazards."
            ],
            "category" : "Emergency response operations"
          },
          {
            "rows" : [
              "R.3.1 Public health and security authorities (e.g. law enforcement, border control, customs) are linked during a suspect or confirmed biological event"
            ],
            "category" : "Linking public health and security authorities"
          },
          {
            "rows" : [
              "R.4.1 System in place for sending and receiving medical countermeasures during a public health emergency",
              "R.4.2 System in place for sending and receiving health personnel during a public health emergency"
            ],
            "category" : "Medical countermeasures and personnel deployment"
          },
          {
            "rows" : [
              "R.5.1 Risk communication systems (plans, mechanisms, etc.)",
              "R.5.2 Internal and partner communication and coordination",
              "R.5.3 Public communication",
              "R.5.4 Communication engagement with affected communities",
              "R.5.5 Dynamic listening and rumour management"
            ],
            "category" : "Risk communication"
          },
          {
            "rows" : [
              "PoE.1 Routine capacities established at points of entry",
              "PoE.2 Effective public health response at points of entry"
            ],
            "category" : "Points of entry"
          },
          {
            "rows" : [
              "CE.1 Mechanisms established and functioning for detecting and responding to chemical events or emergencies",
              "CE.2 Enabling environment in place for management of chemical events"
            ],
            "category" : "Chemical events"
          },
          {
            "rows" : [
              "RE.1 Mechanisms established and functioning for detecting and responding to radiological and nuclear emergencies",
              "RE.2 Enabling environment in place for management of radiation emergencies"
            ],
            "category" : "Radiation emergencies"
          }
        ],
        "columns" : ["CK", "FJ", "KI", "MH", "FM", "NR", "NU", "PW", "PG", "WS", "SB", "TO", "TV", "VU"],
        "stripFromDataElementNames" : "JEE: "
      }',
      '{
        "placeholder" : "\/static\/media\/PEHSMatrixPlaceholder.png",
        "name" : "JEE (WPRO Countries)",
        "entityHeader": "2018",
        "type" : "matrix",
        "presentationOptions" : {
          "type": "range",
          "showRawValue": true,
          "red" : {
            "min" : 0,
            "max" : 1,
            "label" : "",
            "description" : "No capacity: ",
            "color" : "#b71c1c"
          },
          "green" : {
            "min" : 4,
            "max" : 5,
            "label" : "",
            "description" : "Demonstrated/Susainable Capacity: ",
            "color" : "#33691e"
          },
          "yellow" : {
            "min" : 2,
            "max" : 3,
            "label" : "",
            "description" : "Limited/Developed Capacity:", 
            "color" : "#fdd835"
          }
        }
      }'
    );

    UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{WHO_IHR_JEE_WPRO}' WHERE "name" = 'IHR Report';

    UPDATE "dashboardReport"
      SET "viewJson" = jsonb_set("viewJson", '{categoryPresentationOptions, type}', '"range"')
        WHERE "id" IN ('WHO_IHR_SPAR_WPRO', 'WHO_IHR_SPAR_NST');
    
    UPDATE "dashboardReport"
      SET "viewJson" = jsonb_set("viewJson", '{categoryPresentationOptions, showRawValue}', 'true')
        WHERE "id" IN ('WHO_IHR_SPAR_WPRO', 'WHO_IHR_SPAR_NST');

    UPDATE "dashboardReport"
      SET "viewJson" = jsonb_set("viewJson", '{categoryPresentationOptions, green, label}', '""')
        WHERE "id" IN ('WHO_IHR_SPAR_WPRO', 'WHO_IHR_SPAR_NST');
    UPDATE "dashboardReport"
      SET "viewJson" = jsonb_set("viewJson", '{categoryPresentationOptions, red, label}', '""')
        WHERE "id" IN ('WHO_IHR_SPAR_WPRO', 'WHO_IHR_SPAR_NST');
    UPDATE "dashboardReport"
      SET "viewJson" = jsonb_set("viewJson", '{categoryPresentationOptions, yellow, label}', '""')
        WHERE "id" IN ('WHO_IHR_SPAR_WPRO', 'WHO_IHR_SPAR_NST');
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE "id" = 'WHO_IHR_JEE_WPRO';

    UPDATE "dashboardGroup" SET "dashboardReports" = array_remove("dashboardReports", 'WHO_IHR_JEE_WPRO') WHERE "name" = 'IHR Report';

    UPDATE "dashboardReport"
      SET "viewJson" = "viewJson" #- '{categoryPresentationOptions, type}'
        WHERE "id" IN ('WHO_IHR_SPAR_WPRO', 'WHO_IHR_SPAR_NST');
    
    UPDATE "dashboardReport"
      SET "viewJson" = "viewJson" #- '{categoryPresentationOptions, showRawValue}'
        WHERE "id" IN ('WHO_IHR_SPAR_WPRO', 'WHO_IHR_SPAR_NST');
  `);
};

exports._meta = {
  version: 1,
};
