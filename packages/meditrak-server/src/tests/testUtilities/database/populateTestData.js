/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { populateTestData as basePopulateTestData } from '@tupaia/database';
import { getModels } from '../../getModels';

const models = getModels();

/**
 * Generates test data, and stores it in the database. Uses test ids so that all can be cleanly
 * wiped afterwards. Any missing fields on the records passed in are generated randomly or using
 * sensible defaults, using the logic in upsertDummyRecord (see @tupaia/database)
 * @param {} recordsByModelType
 */
export const populateTestData = async recordsByModelType =>
  basePopulateTestData(models, recordsByModelType);
