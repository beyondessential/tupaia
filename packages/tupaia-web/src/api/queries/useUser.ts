/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api.ts';

export const useUser = () => {
  return useQuery('getUser', () => get('getUser'));
};
