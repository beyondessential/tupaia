import { useQuery } from '@tanstack/react-query';
import { Country } from '@tupaia/types';
import { get } from '../api';

export const useCountries = () => {
  return useQuery(['countries'], (): Promise<Partial<Country>[]> => get('countries'));
};
