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

export const useEntitiesData = () =>
  useQuery('entities', () => get('entities'), {
    staleTime: 1000 * 60 * 60 * 1,
    refetchOnWindowFocus: false,
  });
