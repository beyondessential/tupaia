/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { post } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const useReportPreview = ({
  visualisation,
  project,
  location,
  startDate,
  endDate,
  testData,
  enabled,
  onSettled,
  dashboardItemOrMapOverlay,
  previewMode,
}) =>
  useQuery(
    ['fetchReportPreviewData', visualisation],
    async () => {
      const response = await post('fetchReportPreviewData', {
        params: {
          entityCode: location,
          hierarchy: project,
          startDate,
          endDate,
          dashboardItemOrMapOverlay,
          previewMode,
          permissionGroup: visualisation.permissionGroup || visualisation.reportPermissionGroup,
        },
        data: {
          testData,
          previewConfig: visualisation,
        },
      });

      return response.results;
    },
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
      // do not use query cache here because report data
      // should be refetched frequently according to config changes
      enabled,
      keepPreviousData: true,
      onSettled,
    },
  );
