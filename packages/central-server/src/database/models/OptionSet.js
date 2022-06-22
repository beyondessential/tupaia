/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { OptionSetModel as CommonOptionSetModel } from '@tupaia/database';

export class OptionSetModel extends CommonOptionSetModel {
  meditrakConfig = {
    minAppVersion: '1.7.92',
  };
}
