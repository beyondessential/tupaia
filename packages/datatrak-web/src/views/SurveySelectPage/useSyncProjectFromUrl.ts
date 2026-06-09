import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCurrentUserContext } from '../../api';
import { useEditUser } from '../../api/mutations';

/**
 * Syncs the project from a `projectId` URL search param to the user's profile.
 * Returns loading state so the page can show a loader while the update is in flight.
 */
export const useSyncProjectFromUrl = () => {
  const [urlSearchParams] = useSearchParams();
  const urlProjectId = urlSearchParams.get('projectId');
  const user = useCurrentUserContext();
  const { mutate: updateUser, isLoading: isUpdatingUser } = useEditUser();

  useEffect(() => {
    if (urlProjectId && user.projectId !== urlProjectId) {
      updateUser({ projectId: urlProjectId });
    }
  }, [urlProjectId]);

  const isSyncingProject = urlProjectId !== null && urlProjectId !== user?.projectId;

  return { isUpdatingUser, isSyncingProject };
};
