import { useCurrentUserContext } from '../CurrentUserContext';

/**
 * Returns whether to show coconuts and pigs imagery, based on the project config.
 *
 * - `isLoading: true` means the project config hasn't synced yet — callers should show a
 *   skeleton placeholder.
 * - `showCoconutsPigs: true` (default) means the project doesn't opt out.
 * - `showCoconutsPigs: false` means the project has `hideCoconutsAndPigs: true` in its config.
 */
export const useShowCoconutsPigs = () => {
  const { project } = useCurrentUserContext();

  // Project not yet available (e.g. initial sync hasn't completed)
  if (!project) {
    return { showCoconutsPigs: false, isLoading: true };
  }

  return {
    showCoconutsPigs: !project.config?.hideCoconutsAndPigs,
    isLoading: false,
  };
};
