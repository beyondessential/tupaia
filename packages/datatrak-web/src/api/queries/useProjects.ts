/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';

export const useProjects = () => {
  return useQuery(['projects'], () => {
    return [];
  });
};
