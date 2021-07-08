/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ExpandableList } from '../ExpandableList';
import { setMobileDashboardExpanded } from '../../../actions';
import DashboardGroup from '../../../containers/DashboardGroup';
import { DARK_BLUE, WHITE } from '../../../styles';

class DashboardView extends Component {
  shouldComponentUpdate(nextProps) {
    const {
      orgUnit,
      currentDashboardName,
      filterIsExpanded,
      dashboards,
      isDashboardExpanded,
    } = this.props;
    if (
      orgUnit !== nextProps.orgUnit ||
      currentDashboardName !== nextProps.currentDashboardName ||
      filterIsExpanded !== nextProps.filterIsExpanded ||
      dashboards !== nextProps.dashboards ||
      isDashboardExpanded !== nextProps.isDashboardExpanded
    ) {
      return true;
    }
    return false;
  }

  render() {
    const {
      dashboards,
      orgUnit,
      toggleFilter,
      filterIsExpanded,
      currentDashboardName,
      handleFilterChange,
      isDashboardExpanded,
      setDashboardExpanded,
    } = this.props;
    const dashboardTitle = `${orgUnit.name} Dashboard`;
    const filterItems = dashboards.map(({ dashboardName }) => {
      return {
        label: dashboardName,
        id: dashboardName,
        value: dashboardName,
      };
    });
    const currentFilter = filterItems.find(item => item.id === currentDashboardName) || {
      label: 'General',
      id: 'General',
    };

    return (
      <div style={styles.dashboard}>
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
          handleExpandCollapseClick={setDashboardExpanded}
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
      </div>
    );
  }
}

const styles = {
  dashboard: {
    padding: '0',
    background: DARK_BLUE,
    color: WHITE,
    overflow: 'hidden',
  },
};

DashboardView.propTypes = {
  dashboards: PropTypes.array,
  filterIsExpanded: PropTypes.bool,
  isDashboardExpanded: PropTypes.bool,
  setDashboardExpanded: PropTypes.func.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
  toggleFilter: PropTypes.func.isRequired,
  orgUnit: PropTypes.object,
  currentDashboardName: PropTypes.string,
};

DashboardView.defaultProps = {
  filterIsExpanded: false,
  dashboards: [],
  isDashboardExpanded: false,
  orgUnit: {},
  currentDashboardName: '',
};

const mapStateToProps = state => {
  const { isMobileDashboardExpanded } = state.dashboard;

  return {
    isDashboardExpanded: isMobileDashboardExpanded,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setDashboardExpanded: shouldExpand => {
      dispatch(setMobileDashboardExpanded(shouldExpand));
    },
  };
};

export const Dashboard = connect(mapStateToProps, mapDispatchToProps)(DashboardView);
