// useMutationWithContext.ts
import {
  MutationFunction,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

import { AccessPolicy } from '@tupaia/access-policy';
import { useDatabaseContext } from '../../hooks/database';
import { DatatrakWebModelRegistry } from '../../types';
import { CurrentUser, useCurrentUserContext } from '../CurrentUserContext';

interface GlobalMutationContext {
  models: DatatrakWebModelRegistry;
  accessPolicy?: AccessPolicy;
  user?: CurrentUser;
}

export function useDatabaseMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
  TLocalContext extends Record<string, unknown> = {},
>(
  mutationFn: (
    args: { data: TVariables } & GlobalMutationContext & TLocalContext,
  ) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> & {
    localContext?: TLocalContext;
  },
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { models } = useDatabaseContext();
  const { accessPolicy, ...user } = useCurrentUserContext();
  const localContext = (options?.localContext ?? {}) as TLocalContext;

  const wrappedMutationFn: MutationFunction<TData, TVariables> = async (data: TVariables) => {
    return mutationFn({
      data,
      models,
      accessPolicy,
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
