/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { OptionModel as CommonOptionModel } from '@tupaia/database';

export class OptionModel extends CommonOptionModel {
  meditrakConfig = {
    minAppVersion: '1.7.92',
  };
}
