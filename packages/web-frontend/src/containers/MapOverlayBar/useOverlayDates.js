/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import moment from 'moment';
import { getDefaultDates, getLimits, GRANULARITY_CONFIG } from '../../utils/periodGranularities';

export const useOverlayDates = (mapOverlay, onUpdateOverlayPeriod) => {
  if (!mapOverlay) {
    return {};
  }
  const { periodGranularity, isTimePeriodEditable = true, mapOverlayCode } = mapOverlay;
  const defaultDates = getDefaultDates(mapOverlay);
  const { startDate: minStartDate, endDate: maxEndDate } = getLimits(
    periodGranularity,
    mapOverlay.datePickerLimits,
  );
  const showDatePicker = !!(isTimePeriodEditable && periodGranularity);
  // Map overlays always have initial dates, so DateRangePicker always has dates on initialisation,
  // and uses those rather than calculating it's own defaults
  const startDate = mapOverlay.startDate || defaultDates.startDate;
  const endDate = mapOverlay.endDate || defaultDates.endDate;

  const setDates = (_startDate, _endDate) => {
    const period = GRANULARITY_CONFIG[periodGranularity].momentUnit;
    onUpdateOverlayPeriod(mapOverlayCode, {
      startDate: moment(_startDate).startOf(period),
      endDate: moment(_endDate).endOf(period),
    });
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
