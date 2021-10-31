/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ExpandableList } from '../ExpandableList';
import { DashboardGroup } from '../../../containers/DashboardGroup';
import { DARK_BLUE, WHITE } from '../../../styles';

const Container = styled.div`
  padding: 0;
  background: ${DARK_BLUE};
  color: ${WHITE};
  overflow: hidden;
`;

export const Dashboard = ({
  dashboards,
  orgUnit,
  toggleFilter,
  filterIsExpanded,
  currentDashboardName,
  handleFilterChange,
}) => {
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(true);

  const onExpandToggle = () => {
    setIsDashboardExpanded(isExpanded => !isExpanded);
  };

  const dashboardTitle = `${orgUnit.name} Dashboard`;

  const filterItems = dashboards.map(({ dashboardName }) => ({
    label: dashboardName,
    id: dashboardName,
    value: dashboardName,
  }));

  const currentFilter = filterItems.find(item => item.id === currentDashboardName) || {
    label: 'General',
    id: 'General',
  };

  return (
    <Container>
      <ExpandableList
        title={dashboardTitle}
        items={[
          <DashboardGroup
            key={currentFilter.label}
            tab={dashboards.find(d => d.dashboardName === currentFilter.label)}
            compressed
          />,
        ]}
        isExpanded={isDashboardExpanded}
        handleExpandCollapseClick={onExpandToggle}
        filterTitle={dashboardTitle}
        filters={filterItems}
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
        filterIsExpanded={filterIsExpanded}
        onFilterOpen={toggleFilter}
        onFilterClose={toggleFilter}
        showLoadingIcon={false}
        theme={{ background: DARK_BLUE, color: WHITE }}
      />
    </Container>
  );
};

Dashboard.propTypes = {
  dashboards: PropTypes.array,
  filterIsExpanded: PropTypes.bool,
  handleFilterChange: PropTypes.func.isRequired,
  toggleFilter: PropTypes.func.isRequired,
  orgUnit: PropTypes.object,
  currentDashboardName: PropTypes.string,
};

Dashboard.defaultProps = {
  filterIsExpanded: false,
  dashboards: [],
  orgUnit: {},
  currentDashboardName: '',
};
