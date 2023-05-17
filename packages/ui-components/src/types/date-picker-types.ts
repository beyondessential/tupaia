import { Moment } from 'moment';
import { GRANULARITIES } from '@tupaia/utils';

type ValueOf<T> = T[keyof T];

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
};

export type WeekPickerProps = BaseDatePickerProps & {
  weekDisplayFormat?: string;
};

export type GranularityType = ValueOf<typeof GRANULARITIES>;

export type ModifierType = 'startOfWeek' | 'endOfWeek' | undefined;
