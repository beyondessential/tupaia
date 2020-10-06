/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * DisasterList
 *
 * Takes viewContent directly from config server rather than fetching via a dataBuilder
 * and renders a component that will fetch the data it needs from redux state.
 */

import React from 'react';
import PropTypes from 'prop-types';

import DisasterList from './components/Disaster/DisasterList';
import ProjectDescription from './components/Project/ProjectDescription';
import NoAccessDashboard from './components/Dashboard/NoAccessDashboard';
import NoDataAtLevelDashboard from './components/Dashboard/NoDataAtLevelDashboard';

export default function StateDashboardItem(props) {
  const { viewContent } = props;
  const components = {
    ActiveDisasters: DisasterList,
    ProjectDescription,
    NoAccessDashboard,
    NoDataAtLevelDashboard,
  };
  const Component = components[viewContent.componentName];

  return <Component viewContent={viewContent} />;
}

StateDashboardItem.propTypes = {
  viewContent: PropTypes.shape({}),
};
