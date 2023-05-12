/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type { BaseConfig } from './common';

enum VizComponentName {
  ActiveDisasters = 'ActiveDisasters',
  ProjectDescription = 'ProjectDescription',
  NoAccessDashboard = 'NoAccessDashboard',
  NoDataAtLevelDashboard = 'NoDataAtLevelDashboard',
}

/**
 * @description A Component viz type simply renders a React component as the viz
 */
export type ComponentConfig = BaseConfig & {
  type: 'component';

  componentName: VizComponentName;
};
