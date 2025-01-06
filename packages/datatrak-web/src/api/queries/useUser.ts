/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from '@tanstack/react-query';
import { DatatrakWebUserRequest } from '@tupaia/types';
import { get } from '../api';

export const useUser = () => {
  return useQuery(['getUser'], (): Promise<DatatrakWebUserRequest.ResBody> => get('getUser'));
};
