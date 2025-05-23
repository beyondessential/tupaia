import React, { ReactNode, createContext, useContext } from 'react';

import { DatatrakWebUserRequest } from '@tupaia/types';
import { FullPageLoader } from '@tupaia/ui-components';

import { useUser } from './queries';

export interface CurrentUserContextType extends DatatrakWebUserRequest.ResBody {
  isLoggedIn: boolean;
}

const CurrentUserContext = createContext<CurrentUserContextType | null>(null);

export const useCurrentUserContext = (): CurrentUserContextType => {
  const currentUser = useContext(CurrentUserContext);
  if (currentUser === null) {
    throw new Error('useCurrentUserContext must be used within a CurrentUserContextProvider');
  }
  return currentUser;
};

export const CurrentUserContextProvider = ({ children }: { children: Readonly<ReactNode> }) => {
  const currentUserQuery = useUser();

  if (currentUserQuery.isInitialLoading) {
    return <FullPageLoader />;
  }

  const data = currentUserQuery.data;
  const userData = { ...data, isLoggedIn: !!data?.email };

  return <CurrentUserContext.Provider value={userData}>{children}</CurrentUserContext.Provider>;
};
