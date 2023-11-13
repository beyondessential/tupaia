/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { createContext, useContext } from 'react';
import { DatatrakWebUserRequest } from '@tupaia/types';
import { FullPageLoader } from '@tupaia/ui-components';
import { ErrorDisplay } from '../components';
import { useUser } from './queries';

type CurrentUserContextType = (DatatrakWebUserRequest.ResBody & { isLoggedIn: boolean }) | null;

const CurrentUserContext = createContext<CurrentUserContextType>(null);

export const useCurrentUser = () => {
  const currentUser = useContext(CurrentUserContext);
  if (!currentUser) {
    throw new Error('useCurrentUser must be used within a CurrentUserContextProvider');
  }
  return currentUser;
};

export const CurrentUserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const currentUserQuery = useUser();

  if (currentUserQuery.isLoading) {
    return <FullPageLoader />;
  }

  if (currentUserQuery.isError) {
    return <ErrorDisplay title="Error loading user" error={currentUserQuery.error as Error} />;
  }

  const data = currentUserQuery.data;
  const userData = { ...data, isLoggedIn: !!data?.email };

  return <CurrentUserContext.Provider value={userData}>{children}</CurrentUserContext.Provider>;
};
