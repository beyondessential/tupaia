// useMutationWithContext.ts
import {
  MutationFunction,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

import { AccessPolicy } from '@tupaia/access-policy';
import { ensure } from '@tupaia/tsutils';

import { useDatabaseContext } from '../../hooks/database';
import { DatatrakWebModelRegistry } from '../../types';
import { CurrentUser, useCurrentUserContext } from '../CurrentUserContext';
import { useIsOfflineFirst } from '../offlineFirst';

interface GlobalMutationContext {
  models: DatatrakWebModelRegistry;
  accessPolicy: AccessPolicy;
  user: CurrentUser;
}

interface LocalMutationContext {
  readonly [key: string]: unknown;
}

export interface ContextualMutationFunctionContext<TVariables>
  extends GlobalMutationContext,
    LocalMutationContext {
  data: TVariables;
}

export function useDatabaseMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
  TLocalContext extends LocalMutationContext = {},
>(
  mutationFn: (args: ContextualMutationFunctionContext<TVariables>) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> & {
    localContext?: TLocalContext;
  },
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { models } = useDatabaseContext() || {};
  const { accessPolicy, ...user } = useCurrentUserContext();
  const localContext = (options?.localContext ?? {}) as TLocalContext;
  const isOfflineFirst = useIsOfflineFirst();

  const wrappedMutationFn: MutationFunction<TData, TVariables> = async (data: TVariables) => {
    return mutationFn({
      data,
      models: isOfflineFirst ? ensure(models) : models!,
      accessPolicy: ensure(accessPolicy),
      user,
      ...localContext,
    });
  };

  const { localContext: _omit, ...reactQueryOptions } = options ?? {};

  // Remove localContext from options before passing to useQuery

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn: wrappedMutationFn,
    ...reactQueryOptions,
  });
}
