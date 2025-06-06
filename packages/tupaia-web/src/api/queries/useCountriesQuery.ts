import { useQuery } from '@tanstack/react-query';
import { TupaiaWebCountriesRequest } from '@tupaia/types';
import { get } from '../api';

export const useCountriesQuery = () => {
  return useQuery<TupaiaWebCountriesRequest.ResBody>(['countries'], () => get('countries'));
};
