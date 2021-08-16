/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { post } from '../api';

export const useReportPreview = (visualisation, project, location, enabled, setEnabled) =>
  useQuery(
    ['fetchReportPreviewData', visualisation],
    async () => {
      const response = await post('fetchReportPreviewData', {
        params: {
          entityCode: location,
          hierarchy: project,
        },
        data: { previewConfig: visualisation },
      });

      return response.results;
    },
    {
      // do not use query cache here because report data 
      // should be refetched frequently according to config changes
      enabled,
      keepPreviousData: true,
      onSettled: () => {
        setEnabled(false);
      },
    },
  );
