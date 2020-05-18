/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { PERIOD_TYPES } from '@tupaia/utils';

const DHIS_TYPE_TO_PERIOD_TYPE = {
  Daily: PERIOD_TYPES.DAY,
  Weekly: PERIOD_TYPES.WEEK,
  Monthly: PERIOD_TYPES.MONTH,
  Yearly: PERIOD_TYPES.YEAR,
};

export const dhisToTupaiaPeriodType = dhisType => DHIS_TYPE_TO_PERIOD_TYPE[dhisType];
