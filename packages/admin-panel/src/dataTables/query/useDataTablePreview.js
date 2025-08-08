import { useQuery } from '@tanstack/react-query';
import { post } from '../../VizBuilderApp/api/api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../../VizBuilderApp/api/constants';

const trimWhitespace = object => {
  const trimmedObject = Object.fromEntries(
    Object.entries(object).map(([key, value]) => {
      return [key, typeof value === 'string' ? value.trim() : value];
    }),
  );

  return trimmedObject;
};

export const useDataTablePreview = ({ previewConfig, runtimeParams, onSettled }) =>
  useQuery(
    ['fetchDataTablePreviewData'],
    async () => {
      const response = await post('fetchDataTablePreviewData', {
        data: {
          previewConfig: {
            ...previewConfig,
            runtimeParams: trimWhitespace(runtimeParams),
          },
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
