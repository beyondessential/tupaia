// useMutationWithContext.ts
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  MutationFunction,
} from '@tanstack/react-query';
import { CurrentUser, useCurrentUserContext } from '../CurrentUserContext';
import { DatatrakWebModelRegistry } from '../../types';
import { AccessPolicy } from '@tupaia/access-policy';
import { useDatabaseContext } from '../../hooks/database';

// Global context shape
type GlobalMutationContext = {
  models: DatatrakWebModelRegistry;
  accessPolicy?: AccessPolicy;
  user?: CurrentUser;
};

// Full wrapper
export function useDatabaseMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
  TLocalContext extends Record<string, any> = {},
>(
  mutationFn: (
    args: {
      data: TVariables;
    } & GlobalMutationContext &
      TLocalContext,
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
    networkMode: 'always',
    ...reactQueryOptions,
  });
}
