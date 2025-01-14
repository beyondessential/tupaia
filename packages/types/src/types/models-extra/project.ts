import { PermissionGroup } from '../models';

type FrontEndExcludedException = {
  permissionGroups: PermissionGroup['name'][];
};

type FrontEndExcludedConfig = {
  types: string[];
  exceptions?: FrontEndExcludedException;
};

export type ProjectConfig = {
  frontendExcluded?: FrontEndExcludedConfig[];
  permanentRegionLabels?: boolean;
  tileSets?: string;
  includeDefaultTileSets?: boolean;
  projectDashboardHeader?: string;
};
