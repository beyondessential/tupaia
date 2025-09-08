import { DatePickerOffsetSpec, ValueOf } from '@tupaia/types';
import { GRANULARITIES, WEEK_DISPLAY_FORMATS } from '@tupaia/utils';
import { Moment } from 'moment';

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
  dateOffset?: DatePickerOffsetSpec;
  granularity: GranularityType;
  dateRangeDelimiter?: string;
  valueKey: 'startDate' | 'endDate';
};

export type WeekPickerProps = BaseDatePickerProps & {
  weekDisplayFormat?: string;
};

export type GranularityType = ValueOf<typeof GRANULARITIES>;

export type ModifierType = 'startOfWeek' | 'endOfWeek';

export type WeekDisplayFormatType = ValueOf<typeof WEEK_DISPLAY_FORMATS>;
