import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Skeleton } from '@material-ui/lab';
import { useMapOverlays } from '../../../api/queries';
import { useMapOverlayMapData } from '../utils';
import { DateRangePicker } from '../../../components';
import { useDateRanges } from '../../../utils';
import { URL_SEARCH_PARAMS } from '../../../constants';

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.palette.overlaySelector.overlayNameBackground};
  > div {
    margin-top: 0;
  }
`;

export const MapOverlayDatePicker = () => {
  const { projectCode, entityCode } = useParams();
  const { selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const {
    showDatePicker,
    startDate,
    endDate,
    minStartDate,
    maxEndDate,
    setDates,
    periodGranularity,
    onResetDate,
  } = useDateRanges(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD, selectedOverlay);

  const { isLoading: isLoadingMapOverlayData } = useMapOverlayMapData();

  if (!showDatePicker) return null;
  return (
    <Wrapper>
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
          onResetDate={onResetDate}
        />
      )}
    </Wrapper>
  );
};
