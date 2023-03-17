/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { post } from '../../VizBuilderApp/api/api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../../VizBuilderApp/api/constants';

const assignDefaultValueToRuntimeParam = ({ builtInParams, additionalParams, runtimeParams }) => {
  const newRuntimeParams = { ...runtimeParams };

  [...builtInParams, ...additionalParams].forEach(p => {
    const runtimeParameterValue = runtimeParams[p.name];
    if (
      p?.config?.hasDefaultValue &&
      (runtimeParameterValue === undefined ||
        runtimeParameterValue === null ||
        runtimeParameterValue === '' ||
        (Array.isArray(runtimeParameterValue) && runtimeParameterValue.length === 0))
    ) {
      newRuntimeParams[p.name] = p?.config?.defaultValue;
    }
  });

  return newRuntimeParams;
};

export const useDataTablePreview = ({
  previewConfig,
  builtInParams,
  additionalParams,
  runtimeParams,
  onSettled,
}) =>
  useQuery(
    ['fetchDataTablePreviewData'],
    async () => {
      const response = await post('fetchDataTablePreviewData', {
        data: {
          previewConfig: {
            ...previewConfig,
            runtimeParams: assignDefaultValueToRuntimeParam({
              builtInParams,
              additionalParams,
              runtimeParams,
            }),
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
