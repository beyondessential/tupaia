import { useMutation, useQueryClient } from '@tanstack/react-query';
import { put } from '../../VizBuilderApp/api';

/**
 * Persists the user's selected project to user_account.preferences.project_id.
 * This lets the sidebar Single-Project nav stay populated on All Data routes
 * across sessions/reloads.
 *
 * EditUserForMe expects `project_id` as a top-level field, not nested under
 * `preferences` (see EditUserAccounts.js — it explicitly rejects a
 * `preferences` payload).
 */
export const useSaveSelectedProject = () => {
  const queryClient = useQueryClient();
  return useMutation(
    projectId => put('me', { data: { project_id: projectId } }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user']);
      },
    },
  );
};
