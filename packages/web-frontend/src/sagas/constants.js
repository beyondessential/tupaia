import { openEnlargedDialog, setMapOverlaysOnceHierarchyLoads, setOrgUnit } from '../actions';
import { URL_COMPONENTS } from '../historyNavigation';
import { setProject } from '../projects/actions';

export const URL_REFRESH_COMPONENTS = {
  [URL_COMPONENTS.PROJECT]: setProject,
  [URL_COMPONENTS.ORG_UNIT]: setOrgUnit,
  [URL_COMPONENTS.MAP_OVERLAY]: setMapOverlaysOnceHierarchyLoads,
  [URL_COMPONENTS.REPORT]: openEnlargedDialog,
};
