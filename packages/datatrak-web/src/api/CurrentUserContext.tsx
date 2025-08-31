import React, { ReactNode, createContext, useContext } from 'react';

import { AccessPolicy } from '@tupaia/access-policy';
import { DatatrakWebUserRequest } from '@tupaia/types';
import { FullPageLoader } from '@tupaia/ui-components';

import { useUser } from './queries';

export interface CurrentUserContextType
  extends Omit<DatatrakWebUserRequest.ResBody, 'accessPolicy'> {
  isLoggedIn: boolean;
  accessPolicy?: AccessPolicy;
}

export interface CurrentUser extends Omit<CurrentUserContextType, 'accessPolicy'> {}

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
  if (currentUserQuery.isLoading) {
    return <FullPageLoader />;
  }

  const data = currentUserQuery.data;
  const userData = {
    ...data,
    isLoggedIn: !!data?.email,
    accessPolicy: data?.accessPolicy ? new AccessPolicy(data?.accessPolicy) : undefined,
  };

  return <CurrentUserContext.Provider value={userData}>{children}</CurrentUserContext.Provider>;
};
