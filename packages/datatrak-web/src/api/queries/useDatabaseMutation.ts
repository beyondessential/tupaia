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
    // HACK: In offline-first environment, models & accessPolicy genuinely must be defined; but we
    // expect them to be undefined otherwise. Current type definitions aren’t smart enough to know
    // when online or offline logic applies. Hence, we ensure at runtime when actually needed; but
    // lie to the compiler with non-nullish assertion when we don’t care.
    return mutationFn({
      data,
      models: isOfflineFirst
      ? ensure(models, `Expected models to be non-nullish but got ${models}`)
      : models!,
      accessPolicy: isOfflineFirst
        ? ensure(accessPolicy, `Expected accessPolicy to be non-nullish but got ${accessPolicy}`)
        : accessPolicy!,
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
