'use strict';

import { generateId, insertObject, deleteObject } from '../utilities';
import {
  FQS1_CODE_MAPPING,
  FQS2_CODE_MAPPING,
} from './migrationData/20210728020128-AddFQSSurveySyncGroups';

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

const KOBO_SURVEYS = [
  {
    code: 'FQS1',
    config: {
      entityQuestionCode: 'FQS1Primary_location/FQS1PrimarySchool',
      questionMapping: FQS1_CODE_MAPPING,
      internalSurveyCode: 'LESMIS_FQS1',
      koboSurveyCode: 'aae6Nbi2TVrNcwNwi4zYbm',
    },
  },
  {
    code: 'FQS2',
    config: {
      entityQuestionCode: 'FQS2Primary_location/FQS2PrimarySchool',
      questionMapping: FQS2_CODE_MAPPING,
      internalSurveyCode: 'LESMIS_FQS2',
      koboSurveyCode: 'ahEoK9WiEA4iVm4GnepcNt',
    },
  },
];

exports.up = async function (db) {
  for (const { code, config } of KOBO_SURVEYS) {
    await insertObject(db, 'data_service_sync_group', {
      id: generateId(),
      code,
      service_type: 'kobo',
      config,
    });
  }
};

exports.down = async function (db) {
  for (const { code } of KOBO_SURVEYS) {
    await deleteObject(db, 'data_service_sync_group', { code });
  }
};

exports._meta = {
  version: 1,
};
