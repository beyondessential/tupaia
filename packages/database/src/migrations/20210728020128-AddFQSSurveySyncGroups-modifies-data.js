'use strict';

import { generateId, insertObject, deleteObject } from '../utilities';
import {
  FQS1_CODE_MAPPING,
  FQS2_CODE_MAPPING,
} from './migrationData/20210726233011-AddFQSQuestionMappings';

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
    entityQuestionCode: 'FQS1Primary_location/FQS1PrimarySchool',
    questionCodeMapping: FQS1_CODE_MAPPING,
  },
  {
    code: 'FQS2',
    entityQuestionCode: 'FQS2Primary_location/FQS2PrimarySchool',
    questionCodeMapping: FQS2_CODE_MAPPING,
  },
];

exports.up = async function (db) {
  for (const { code, entityQuestionCode, questionCodeMapping } of KOBO_SURVEYS) {
    await insertObject(db, 'data_service_sync_group', {
      id: generateId(),
      code,
      service_type: 'kobo',
      config: {
        // koboSurveyCode: 'xyz',
        entityQuestionCode,
        questionCodeMapping,
      },
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
