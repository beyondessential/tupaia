/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { DatatrakWebProjectsRequest } from '@tupaia/types';
import { get } from '../api';

export const useProjects = () => {
  return useQuery('projects', (): Promise<DatatrakWebProjectsRequest.ResBody> => get('projects'));
};
