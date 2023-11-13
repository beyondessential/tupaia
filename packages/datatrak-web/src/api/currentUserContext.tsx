/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { createContext, useContext } from 'react';
import { DatatrakWebUserRequest } from '@tupaia/types';
import { FullPageLoader } from '@tupaia/ui-components';
import { useUser } from './queries';

type UserContextType =
  | (DatatrakWebUserRequest.ResBody & { isLoggedIn: boolean; name?: string })
  | null;

const UserContext = createContext<UserContextType>(null);

export const useCurrentUser = () => {
  const currentUser = useContext(UserContext);
  if (!currentUser) {
    throw new Error('CurrentUserContext: No value provided');
  }
  return currentUser;
};

export const CurrentUserContext = ({ children }: { children: React.ReactNode }) => {
  const currentUserQuery = useUser();

  if (currentUserQuery.isLoading) {
    return <FullPageLoader />;
  }

  if (currentUserQuery.isError) {
    // TODO: use error view component
    return <div>Error</div>;
  }

  const data = currentUserQuery.data;
  const userData = { ...data, name: data?.userName, isLoggedIn: !!data?.email };

  return <UserContext.Provider value={userData}>{children}</UserContext.Provider>;
};
