/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../api';

export const useProjects = () => {
  return useQuery(['projects'], () => get(`projects`), {
    staleTime: 1000 * 60 * 60 * 1,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
