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

exports.up = async function (db) {
  for (const mapping of [FQS1_CODE_MAPPING, FQS2_CODE_MAPPING]) {
    for (const [koboCode, tupaiaCode] of Object.entries(mapping)) {
      await insertObject(db, 'data_source', {
        id: generateId(),
        code: koboCode,
        type: 'dataElement',
        service_type: 'kobo',
        config: { internalQuestionCode: tupaiaCode },
      });
    }
  }
};

exports.down = async function (db) {
  for (const mapping of [FQS1_CODE_MAPPING, FQS2_CODE_MAPPING]) {
    for (const code of Object.keys(mapping)) {
      await deleteObject(db, 'data_source', { code });
    }
  }
};

exports._meta = {
  version: 1,
};
