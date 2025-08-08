import { useSearchParams } from 'react-router-dom';
import moment, { Moment } from 'moment';
import { TupaiaWebMapOverlaysRequest, DashboardItemConfig } from '@tupaia/types';
import {
  GRANULARITY_CONFIG,
  GRANULARITIES,
  getDefaultDates,
  getLimits,
  momentToDateDisplayString,
  GRANULARITIES_WITH_ONE_DATE,
  roundStartEndDates,
} from '@tupaia/utils';
import { DEFAULT_PERIOD_PARAM_STRING } from '../constants';

type SelectableMapOverlay = TupaiaWebMapOverlaysRequest.TranslatedMapOverlay;

// converts the date range to a URL period string
export const convertDateRangeToUrlPeriodString = (
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
  selectedItem?: SelectableMapOverlay | DashboardItemConfig,
) => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  if (!selectedItem) {
    return {};
  }

  const currentPeriodString = urlSearchParams.get(urlParam) || DEFAULT_PERIOD_PARAM_STRING;

  const { periodGranularity, datePickerLimits } = selectedItem;

  // this only applies to dashboard items, not map overlays
  const weekDisplayFormat =
    'weekDisplayFormat' in selectedItem ? selectedItem.weekDisplayFormat : undefined;
  // this only applies to dashboard items, not map overlays
  const dateOffset = 'dateOffset' in selectedItem ? selectedItem.dateOffset : undefined;

  // this only applies to map overlays
  const isTimePeriodEditable =
    'isTimePeriodEditable' in selectedItem ? selectedItem.isTimePeriodEditable : true;

  const getInitialStartDate = () => {
    if ('startDate' in selectedItem) {
      return selectedItem.startDate;
    }
    return undefined;
  };

  const getInitialEndDate = () => {
    if ('endDate' in selectedItem) {
      return selectedItem.endDate;
    }
    return undefined;
  };

  const itemStartDate = getInitialStartDate();
  const itemEndDate = getInitialEndDate();

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

  const { startDate: urlStartDate, endDate: urlEndDate } =
    convertUrlPeriodStringToDateRange(currentPeriodString);

  const startDate = urlStartDate || itemStartDate || defaultStartDate;
  const endDate = urlEndDate || itemEndDate || defaultEndDate;

  const setDates = (_startDate: string, _endDate: string) => {
    const selectedGranularity = dateOffset ? dateOffset.unit : periodGranularity;
    const period = GRANULARITY_CONFIG[selectedGranularity as keyof typeof GRANULARITY_CONFIG]
      .momentUnit as moment.unitOfTime.StartOf;

    const periodStartDate = moment(_startDate).startOf(period);
    const periodEndDate = moment(_endDate).endOf(period);

    const urlPeriodString = convertDateRangeToUrlPeriodString({
      startDate: periodStartDate,
      endDate: periodEndDate,
    });
    urlSearchParams.set(urlParam, urlPeriodString);
    setUrlSearchParams(urlSearchParams);
  };

  const onResetDate = () => {
    urlSearchParams.set(urlParam, DEFAULT_PERIOD_PARAM_STRING);
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
