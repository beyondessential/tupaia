import { useQuery } from '@tanstack/react-query';
import { DatatrakWebUserRequest } from '@tupaia/types';
import { get } from '../api';

export const useUser = () => {
  return useQuery<DatatrakWebUserRequest.ResBody>(['getUser'], () => get('getUser'));
};
