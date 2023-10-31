/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export interface ProjectConfig {
  permanentRegionLabels?: boolean;
  tileSets?: string;
  includeDefaultTileSets?: boolean;
  projectDashboardHeader?: string;
  frontendExcluded?: {
    types: string[];
    exceptions?: { permissionGroups: string[] };
  }[];
  allowSendToMailingListPermissionGroups?: string[];
}
