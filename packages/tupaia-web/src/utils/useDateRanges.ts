import { useSearchParams } from 'react-router-dom';
import moment, { Moment } from 'moment';
import {
  GRANULARITY_CONFIG,
  GRANULARITIES,
  getDefaultDates,
  getLimits,
  momentToDateDisplayString,
  GRANULARITIES_WITH_ONE_DATE,
  roundStartEndDates,
} from '@tupaia/utils';
import { DashboardItemType, SingleMapOverlayItem } from '../types';
import { DEFAULT_PERIOD_PARAM_STRING } from '../constants';

// converts the date range to a URL period string
const convertDateRangeToUrlPeriodString = (
  {
    startDate,
    endDate,
  }: {
    startDate: Moment;
    endDate: Moment;
  },
  granularity = GRANULARITIES.DAY,
) => {
  if (!(startDate || endDate)) return null;

  const { urlFormat } = GRANULARITY_CONFIG[granularity];

  const formattedStartDate = momentToDateDisplayString(
    startDate,
    granularity,
    urlFormat,
    undefined,
  );
  const formattedEndDate = momentToDateDisplayString(endDate, granularity, urlFormat, undefined);

  return GRANULARITIES_WITH_ONE_DATE.includes(granularity)
    ? formattedEndDate
    : `${formattedStartDate}-${formattedEndDate}`;
};

// converts the URL period string to a date range
const convertUrlPeriodStringToDateRange = (
  periodString: string,
  granularity = GRANULARITIES.DAY,
): {
  startDate: Moment | null;
  endDate: Moment | null;
} => {
  const [startDate, endDate] = periodString.split('-');

  if (!startDate || periodString === DEFAULT_PERIOD_PARAM_STRING) {
    return {
      startDate: null,
      endDate: null,
    };
  }

  const { urlFormat } = GRANULARITY_CONFIG[granularity];

  const momentStartDate = moment(startDate, urlFormat);

  if (GRANULARITIES_WITH_ONE_DATE.includes(granularity)) {
    return {
      startDate: momentStartDate,
      endDate: momentStartDate,
    };
  }
  // We rely on dates being rounded in state for range formats
  const momentEndDate = moment(endDate, urlFormat);
  return roundStartEndDates(granularity, momentStartDate, momentEndDate);
};

/**
 * This handles the logic for setting and getting the dates for the dates with map overlays and reports, including updating the URLSearchParams
 */
export const useDateRanges = (
  urlParam: string,
  selectedItem?: SingleMapOverlayItem | DashboardItemType,
) => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  if (!selectedItem) {
    return {};
  }

  const currentPeriodString = urlSearchParams.get(urlParam) || '';

  const {
    periodGranularity,
    isTimePeriodEditable = true,
    startDate: itemStartDate,
    endDate: itemEndDate,
    datePickerLimits,
    weekDisplayFormat,
  } = selectedItem;

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDates(
    selectedItem,
  ) as {
    startDate: Moment;
    endDate: Moment;
  };

  const { startDate: minStartDate, endDate: maxEndDate } = getLimits(
    periodGranularity,
    datePickerLimits,
  );

  const showDatePicker = !!(isTimePeriodEditable && periodGranularity);

  const { startDate: urlStartDate, endDate: urlEndDate } = convertUrlPeriodStringToDateRange(
    currentPeriodString,
    periodGranularity,
  );

  const startDate = urlStartDate || itemStartDate || defaultStartDate;
  const endDate = urlEndDate || itemEndDate || defaultEndDate;

  const setDates = (_startDate: string, _endDate: string) => {
    const period = GRANULARITY_CONFIG[periodGranularity as keyof typeof GRANULARITY_CONFIG]
      .momentUnit as moment.unitOfTime.StartOf;
    const startDate = moment(_startDate).startOf(period);
    const endDate = moment(_endDate).endOf(period);
    const urlPeriodString = convertDateRangeToUrlPeriodString(
      { startDate, endDate },
      periodGranularity,
    );
    urlSearchParams.set(urlParam, urlPeriodString);
    setUrlSearchParams(urlSearchParams);
  };

  const onResetDate = () => {
    urlSearchParams.delete(urlParam);
    setUrlSearchParams(urlSearchParams);
  };

  return {
    showDatePicker,
    startDate,
    endDate,
    minStartDate,
    maxEndDate,
    setDates,
    periodGranularity,
    weekDisplayFormat,
    onResetDate,
  };
};
