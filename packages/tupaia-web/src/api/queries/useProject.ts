/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { useQuery } from 'react-query';
import { SingleProject } from '../../types';
import { get } from '../api';
import { useHandleNoAccessError } from '../../utils';

export const useProject = (projectCode?: string) => {
  const handleNoAccessError = useHandleNoAccessError(true);
  return useQuery(
    ['project', projectCode],
    (): Promise<SingleProject> => get(`project/${projectCode}`, {}),
    {
      enabled: !!projectCode,
      onSuccess: (data: SingleProject) => {
        if (!data?.hasAccess) {
          handleNoAccessError();
        }
      },
    },
  );
};
