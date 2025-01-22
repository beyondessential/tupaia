import { DashboardItemType } from '../common';
import type { BaseConfig } from './common';

enum VizComponentName {
  ProjectDescription = 'ProjectDescription',
  NoAccessDashboard = 'NoAccessDashboard',
  NoDataAtLevelDashboard = 'NoDataAtLevelDashboard',
}

/**
 * @description A Component viz type simply renders a React component as the viz
 */
export type ComponentConfig = BaseConfig & {
  type: `${DashboardItemType.Component}`;
  componentName: `${VizComponentName}`;
};
