import { useQuery } from '@tanstack/react-query';
import { post } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const usePresentationOptionsPromptQuery = (message, dataStructure, useQueryOptions = {}) => {
  const { enabled = true, ...rest } = useQueryOptions;

  const queryKey = ['presentationOptionsPrompt', message];
  const queryFn = () =>
    post('presentationOptionsPrompt', { data: { inputMessage: message, dataStructure } });
  const options = {
    ...DEFAULT_REACT_QUERY_OPTIONS,
    ...rest,
    enabled,
  };

  return useQuery(queryKey, queryFn, options);
};
