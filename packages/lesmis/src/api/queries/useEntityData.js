/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import axios from 'axios';
import { useQuery } from 'react-query';
import { PROJECT_CODE, COUNTRY_CODE } from '../../constants';
import { useUrlParams } from '../../utils';
import { get } from '../api';

// Todo: optimise to use the cached entities data if available
export const useEntityData = ({ entityCode }) =>
  useQuery(['entity', entityCode], () => get(`entity/${entityCode}`), {
    staleTime: 1000 * 60 * 60 * 1,
    refetchOnWindowFocus: false,
  });
