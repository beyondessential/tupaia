import { useQuery } from '@tanstack/react-query';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const usePromptMessageQuery = (messages, useQueryOptions) => {
  const { enabled = true, ...rest } = useQueryOptions;

  const queryKey = ['prompt-message'];
  const queryFn = () => get('prompt-message');
  const options = {
    ...DEFAULT_REACT_QUERY_OPTIONS,
    ...rest,
    enabled: enabled && messages.length > 0,
  };

  return useQuery(queryKey, queryFn, options);
};
