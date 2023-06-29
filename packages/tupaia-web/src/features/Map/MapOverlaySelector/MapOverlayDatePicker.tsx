/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton } from '@material-ui/lab';
import { useMapOverlayData, useMapOverlays } from '../../../api/queries';
import { DateRangePicker } from '../../../components';
import { useMapOverlayDates } from '../../../utils';

export const MapOverlayDatePicker = () => {
  const { projectCode, entityCode } = useParams();
  const { selectedOverlay, selectedOverlayCode } = useMapOverlays(projectCode, entityCode);
  const {
    showDatePicker,
    startDate,
    endDate,
    minStartDate,
    maxEndDate,
    setDates,
    periodGranularity,
  } = useMapOverlayDates(selectedOverlay);

  const { isLoading: isLoadingMapOverlayData } = useMapOverlayData(
    projectCode,
    entityCode,
    selectedOverlayCode,
    selectedOverlay?.legacy,
    {
      startDate,
      endDate,
    },
  );

  if (!showDatePicker) return null;
  return (
    <div>
      {isLoadingMapOverlayData ? (
        <>
          <Skeleton animation="wave" width={200} height={20} />
          <Skeleton animation="wave" width={100} height={14} />
        </>
      ) : (
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          minDate={minStartDate}
          maxDate={maxEndDate}
          granularity={periodGranularity}
          onSetDates={setDates}
        />
      )}
    </div>
  );
};
