/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { AccessPolicy } from '@tupaia/access-policy';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';
import { VIZ_BUILDER_USER_PERMISSION_GROUP } from '../../../authentication';

export const useUser = () => {
  const query = useQuery('user', () => get('user'), {
    ...DEFAULT_REACT_QUERY_OPTIONS,
  });
  const user = query.data;
  const isLoggedIn = user && Object.keys(user).length > 0;
  const isVizBuilderUser =
    user &&
    new AccessPolicy(user.accessPolicy).allowsSome(undefined, VIZ_BUILDER_USER_PERMISSION_GROUP);

  return { ...query, isLoggedIn, isVizBuilderUser };
};
