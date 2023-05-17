import { Moment } from 'moment';

export type BaseDatePickerProps = {
  momentDateValue: Moment;
  onChange: (date: Moment) => void;
  minMomentDate: Moment;
  maxMomentDate: Moment;
};

export type YearPickerProps = BaseDatePickerProps & {
  isIsoYear: boolean;
};

export type WeekPickerProps = BaseDatePickerProps & {
  weekDisplayFormat?: string;
};
