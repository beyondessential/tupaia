/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { get } from '../api';

export const useMapOverlaysData = ({ entityCode }) =>
  useQuery(['overlays', entityCode], () => get(`map-overlays/${entityCode}`), {
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
