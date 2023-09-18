/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { DatatrakWebUserRequest } from '@tupaia/types';
import { get } from '../api';
import { useProjects } from './useProjects.ts';

export const useUser = () => {
  const userResponse = useQuery(
    'getUser',
    (): Promise<DatatrakWebUserRequest.ResBody> => get('getUser'),
  );
  const { data: projects } = useProjects();

  const { data: user } = userResponse;
  const userProject = projects?.find(({ id }) => id === user?.projectId);

  return {
    ...userResponse,
    data: { ...user, name: user?.userName, project: userProject },
    isLoggedIn: !!user?.email,
  };
};
