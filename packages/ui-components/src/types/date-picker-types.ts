import { Moment } from 'moment';
import { GRANULARITIES, WEEK_DISPLAY_FORMATS } from '@tupaia/utils';
import { ValueOf } from './helpers';
import { DateOffsetSpec } from '@tupaia/types';

export type BaseDatePickerProps = {
  momentDateValue: Moment;
  onChange: (date: Moment) => void;
  minMomentDate: Moment;
  maxMomentDate: Moment;
};

export type YearPickerProps = Pick<
  BaseDatePickerProps,
  'maxMomentDate' | 'minMomentDate' | 'momentDateValue'
> & {
  isIsoYear?: boolean;
  onChange: (date: Moment | number) => void;
  dateOffset?: DateOffsetSpec;
  granularity: GranularityType;
  dateRangeDelimiter?: string;
};

export type WeekPickerProps = BaseDatePickerProps & {
  weekDisplayFormat?: string;
};

export type GranularityType = ValueOf<typeof GRANULARITIES>;

export type ModifierType = 'startOfWeek' | 'endOfWeek';

export type WeekDisplayFormatType = ValueOf<typeof WEEK_DISPLAY_FORMATS>;
