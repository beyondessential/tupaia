import { PROJECT_ACCESS_TYPES } from '../constants';
import { SingleProject } from '../types';

export const getProjectAccessType = (project: SingleProject) => {
  if (!project) return null;
  const { hasAccess, hasPendingAccess } = project;
  if (hasPendingAccess) {
    return PROJECT_ACCESS_TYPES.PENDING;
  }
  if (hasAccess) {
    return PROJECT_ACCESS_TYPES.ALLOWED;
  }
  return PROJECT_ACCESS_TYPES.DENIED;
};
