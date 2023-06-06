/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api.ts';

export const useProjects = () => {
  return useQuery('projects', () => get('projects'));
};
