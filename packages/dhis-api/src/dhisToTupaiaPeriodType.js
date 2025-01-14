import { PERIOD_TYPES } from '@tupaia/tsutils';

const DHIS_TYPE_TO_PERIOD_TYPE = {
  Daily: PERIOD_TYPES.DAY,
  Weekly: PERIOD_TYPES.WEEK,
  Monthly: PERIOD_TYPES.MONTH,
  Quarterly: PERIOD_TYPES.QUARTER,
  Yearly: PERIOD_TYPES.YEAR,
};

export const dhisToTupaiaPeriodType = dhisType => DHIS_TYPE_TO_PERIOD_TYPE[dhisType];
