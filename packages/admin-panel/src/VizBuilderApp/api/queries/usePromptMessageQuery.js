import { useQuery } from '@tanstack/react-query';
import { post } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const usePromptMessageQuery = (message, dataStructure, useQueryOptions = {}) => {
  const { enabled = true, ...rest } = useQueryOptions;

  const queryKey = ['prompt-message', message];
  const queryFn = () => post('prompt-message', { data: { inputMessage: message, dataStructure } });
  const options = {
    ...DEFAULT_REACT_QUERY_OPTIONS,
    ...rest,
    enabled,
  };

  return useQuery(queryKey, queryFn, options);
};
