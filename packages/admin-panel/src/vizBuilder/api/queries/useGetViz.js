/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { get } from '../api';

export const useGetViz = code =>
  useQuery(['dashboard', code], () => get(`viz/${code}`), {
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
