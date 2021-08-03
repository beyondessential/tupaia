/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { post } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const useReportPreview = (config, enabled, setEnabled) =>
  useQuery(
    ['fetchReportPreviewData', config],
    async () => {
      const response = await post('fetchReportPreviewData', {
        params: {
          entityCode: config.location,
          hierarchy: config.project,
        },
        data: { previewConfig: config },
      });

      return response.results;
    },
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
      enabled,
      keepPreviousData: true,
      onSettled: () => {
        setEnabled(false);
      },
    },
  );
