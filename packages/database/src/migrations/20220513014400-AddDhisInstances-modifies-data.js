'use strict';

const { generateId, insertObject } = require('../utilities');

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

const DHIS_INSTANCES = [
  {
    id: generateId(),
    code: 'regional',
    readonly: false,
    config: {
      productionUrl: 'https://aggregation.tupaia.org',
      devUrl: 'https://dev-aggregation.tupaia.org',
    },
  },
  {
    id: generateId(),
    code: 'tonga',
    readonly: false,
    config: {
      productionUrl: 'https://tonga-aggregation.tupaia.org',
      devUrl: 'https://dev-tonga-aggregation.tupaia.org',
    },
  },
  {
    id: generateId(),
    code: 'lao-peoples-democratic-republic',
    readonly: true,
    config: {
      productionUrl: 'https://hmis.gov.la/hmis',
      devUrl: 'https://hmis.gov.la/hmis',
    },
  },
  {
    id: generateId(),
    code: 'palau',
    readonly: false,
    config: {
      productionUrl: 'https://dhis2.palauhealth.org',
      devUrl: 'https://dev-dhis2.palauhealth.org',
    },
  },
];

const TABLES = ['data_element', 'data_group'];

/**
 * DataSources and Entities are linked to a specific DHIS server in many ways:
 *
 * ### Standard Way:
 *  - if the DataSource for which the data is being pulled/pushed has service_type = dhis:
 *   - if DataSource has isDataRegional = true | undefined, the regional DHIS server is used
 *   - if DataSource has isDataRegional = false, entity.code is used to determine which DHIS server to use,
 *      e.g. TO_Some_Facility will see "TO" and use Tonga DHIS. Note: entity.metadata.dhis.isDataRegional is ignored.
 *
 * ### All the different ways:
 * - DataBroker:
 *   - pulling/pushing data:
 *     - Uses [Standard Way].
 * - DHIS Sync:
 *   - Entity:
 *     - entity.metadata.dhis.isDataRegional will be used to determine which DHIS server to use
 *   - SurveyResponse:
 *     - Uses [Standard Way], finding the data group the survey is linked to to use as the DataSource
 *   - Answer:
 *     - Finds SurveyResponse this answer is linked to, and uses that method with it.
 * - Pre-aggregation:
 *   - Always uses regional DHIS, hardcoded
 *
 * ## Changes
 * This migration only tackles a cleanup of the [Standard Way]. This migration introduces DhisInstance as a first
 * class model. We link data_source to dhis_instance via config option `data_source.config.dhisInstanceCode: <string>`.
 *
 * For entity based resolution, where previously we had isDataRegional = false, we now leave dhisInstanceCode
 * not set, which indicates no specific dhisInstance, and that we need to resolve it from the entity.
 */

exports.up = async function (db) {
  for (const instance of DHIS_INSTANCES) {
    await insertObject(db, 'dhis_instance', instance);
  }

  for (const table of TABLES) {
    await db.runSql(`ALTER TABLE ${table} DISABLE TRIGGER ${table}_trigger;`);

    // Regional, we migrate trivially
    //   - note: undefined defaults to regional
    await db.runSql(`
      UPDATE ${table} 
      SET config = (config || '{"dhisInstanceCode": "regional"}') #- '{isDataRegional}'
      WHERE service_type = 'dhis' 
        AND (config->'isDataRegional' is null or config->'isDataRegional' = 'true')
    `);
    // Non-regional
    //   - this is our detect-dhis, dhisInstanceCode is null
    await db.runSql(`
      UPDATE ${table} 
      SET config = (config || '{"dhisInstanceCode": null}') #- '{isDataRegional}'
      WHERE service_type = 'dhis' 
        AND config->'isDataRegional' = 'false'
    `);

    await db.runSql(`ALTER TABLE ${table} ENABLE TRIGGER ${table}_trigger;`);
  }
};

exports.down = async function (db) {
  for (const table of TABLES) {
    await db.runSql(`ALTER TABLE ${table} DISABLE TRIGGER ${table}_trigger;`);

    // - Regional
    await db.runSql(`
      UPDATE ${table} 
      SET config = (config || '{"isDataRegional": true}') #- '{dhisInstanceCode}'
      WHERE service_type = 'dhis' 
        AND config->>'dhisInstanceCode' = 'regional'
    `);

    // - Non-regional
    await db.runSql(`
      UPDATE ${table} 
      SET config = (config || '{"isDataRegional": false}') #- '{dhisInstanceCode}'
      WHERE service_type = 'dhis' 
        AND config->>'dhisInstanceCode' = 'null'
    `);

    await db.runSql(`ALTER TABLE ${table} ENABLE TRIGGER ${table}_trigger;`);
  }

  await db.runSql(`TRUNCATE TABLE dhis_instance`);
};

exports._meta = {
  version: 1,
};
