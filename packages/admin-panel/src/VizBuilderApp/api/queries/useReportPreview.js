import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
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
    ['fetchReportPreviewData', visualisation, previewMode],
    async () => {
      const today = moment().format('YYYY-MM-DD');
      const endDateToUse = endDate ?? today; // default to today if no end date is provided, so that we are getting data in the user's timezone, not UTC
      const response = await post('fetchReportPreviewData', {
        params: {
          entityCode: location,
          hierarchy: project,
          startDate,
          endDate: endDateToUse,
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
