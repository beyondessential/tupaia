import React, { ReactNode, createContext, useContext } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

import { AccessPolicy } from '@tupaia/access-policy';
import { DatatrakWebUserRequest } from '@tupaia/types';
import { FullPageLoader } from '@tupaia/ui-components';
import { useUser } from './queries';
import { useIsSyncing } from '../sync/syncStatus';

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
  const isLoggingOut = useIsMutating(['logout']);
  const isSyncing = useIsSyncing();

  if (currentUserQuery.isLoading) {
    // This doesn’t necessarily mean logging in. Fetching user may return {}.
    return <FullPageLoader />;
  }

  if (isLoggingOut) {
    return <FullPageLoader message={isSyncing ? 'Finishing sync…' : 'Logging out…'} />;
  }

  const data = currentUserQuery.data;
  const userData = {
    ...data,
    isLoggedIn: !!data?.email,
    accessPolicy: data?.accessPolicy ? new AccessPolicy(data?.accessPolicy) : undefined,
  };

  console.log('userDataaaaa:', userData);

  return <CurrentUserContext.Provider value={userData}>{children}</CurrentUserContext.Provider>;
};
