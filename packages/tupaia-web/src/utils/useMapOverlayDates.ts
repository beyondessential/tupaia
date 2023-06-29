import { useSearchParams } from 'react-router-dom';
import moment, { Moment } from 'moment';
import {
  GRANULARITIES,
  GRANULARITIES_WITH_ONE_DATE,
  GRANULARITY_CONFIG,
  getDefaultDates,
  getLimits,
  momentToDateDisplayString,
  roundStartEndDates,
} from '@tupaia/utils';
import { DEFAULT_PERIOD_PARAM_STRING, URL_SEARCH_PARAMS } from '../constants';

import { SingleMapOverlayItem } from '../types';

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
 * This handles the logic for setting and getting the dates for the dates with map overlays, including updating the URLSearchParams with the overlay period
 */
export const useMapOverlayDates = (selectedOverlay?: SingleMapOverlayItem) => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  if (!selectedOverlay) {
    return {};
  }

  const currentPeriodString = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD);

  const {
    periodGranularity,
    isTimePeriodEditable = true,
    startDate: mapOverlayStartDate,
    endDate: mapOverlayEndDate,
    datePickerLimits,
  } = selectedOverlay;

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDates(
    selectedOverlay,
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
    currentPeriodString!,
    periodGranularity,
  );
  // Map overlays always have initial dates, so DateRangePicker always has dates on initialisation,
  // and uses those rather than calculating it's own defaults
  const startDate = urlStartDate || mapOverlayStartDate || defaultStartDate;
  const endDate = urlEndDate || mapOverlayEndDate || defaultEndDate;

  const setDates = (_startDate: string, _endDate: string) => {
    const period = GRANULARITY_CONFIG[periodGranularity as keyof typeof GRANULARITY_CONFIG]
      .momentUnit as moment.unitOfTime.StartOf;
    const startDate = moment(_startDate).startOf(period);
    const endDate = moment(_endDate).endOf(period);
    const urlPeriodString = convertDateRangeToUrlPeriodString(
      { startDate, endDate },
      periodGranularity,
    );
    urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD, urlPeriodString);
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
  };
};
