/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { post } from '../../VizBuilderApp/api/api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../../VizBuilderApp/api/constants';

export const useDataTablePreview = ({ previewConfig, runtimeParameters, onSettled }) =>
  useQuery(
    ['fetchDataTablePreviewData', previewConfig],
    async () => {
      const response = await post('fetchDataTablePreviewData', {
        data: {
          previewConfig: { ...previewConfig, runtimeParameters },
        },
      });

      return response;
    },
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
      // do not use query cache here because report data
      // should be refetched frequently according to config changes
      enabled: false,
      keepPreviousData: true,
      onSettled,
    },
  );
