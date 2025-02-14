import { convertPeriodStringToDateRange } from '@tupaia/utils';

type Options = Partial<{
  period: string;
  startDate: string;
  endDate: string;
}>;

interface TranslatedOptions {
  startDate: string;
  endDate: string;
}

// converts from the options requested by data-broker clients (which may use 'period') to that used
// by tupaia internal apis (TupaiaDataApi/IndicatorApi)
export const translateOptionsForApi = ({
  period,
  ...restOfOptions
}: Options): TranslatedOptions => {
  if (!period) return restOfOptions as TranslatedOptions;
  const [startDate, endDate] = convertPeriodStringToDateRange(period);
  return {
    ...restOfOptions,
    // if start/end dates are also provided (and not null, undefined, or 0), favour them over period
    startDate: restOfOptions.startDate || startDate,
    endDate: restOfOptions.endDate || endDate,
  };
};
