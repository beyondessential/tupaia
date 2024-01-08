/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';

export const useProjects = () => {
  return useQuery(
    'projects',
    () =>
      get('projects', {
        params: {
          showExcludedProjects: false,
        },
      }),
    {
      placeholderData: {
        projects: [],
      },
    },
  );
};
