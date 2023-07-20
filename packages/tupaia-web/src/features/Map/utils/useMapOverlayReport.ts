/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useParams } from 'react-router';
import {
  useMapOverlays,
  useMapOverlayReport as useMapOverlayReportQuery,
} from '../../../api/queries';
import { useDateRanges } from '../../../utils';
import { URL_SEARCH_PARAMS } from '../../../constants';

export const useMapOverlayReport = () => {
  const { projectCode, entityCode } = useParams();
  const { selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const { startDate, endDate } = useDateRanges(
    URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD,
    selectedOverlay,
  );
  return useMapOverlayReportQuery(projectCode, entityCode, selectedOverlay, {
    startDate,
    endDate,
  });
};
