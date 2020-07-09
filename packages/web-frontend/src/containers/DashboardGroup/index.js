/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * DashboardGroup
 *
 * Listens to redux state and maps a 6 column grid of DashboardItems, based on tab selected and
 * And the tabs config within the dashboard config. DashboardItems handle their own data fetching,
 * based on a prop provided to describing what to fetch.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import DashboardItem from '../DashboardItem';
import StateDashboardItem from '../StateDashboardItem';
import { DASHBOARD_VIEW_MARGIN } from '../../styles';
import { getUniqueViewId } from '../../utils/getUniqueViewId';

const Grid = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;
  align-items: stretch;
  padding-top: ${DASHBOARD_VIEW_MARGIN}px;
`;

const GridCompressed = styled.div``;

export default class DashboardGroup extends Component {
  renderDashboardItems() {
    const { tab, isSidePanelExpanded } = this.props;

    if (!tab) return null;
    const subTabs = Object.values(tab);
    if (subTabs.length < 1) return null;
    // Get an array of all views
    const allViews = subTabs.reduce((views, subTab) => {
      const { dashboardGroupId, organisationUnitCode, project } = subTab;
      return views.concat(
        // Seed each view with dashboardGroupId from it's subTab
        subTab.views.map(view => ({ ...view, dashboardGroupId, organisationUnitCode, project })),
      );
    }, []);
    // Filter out views that have the same viewId (removes duplicates across subTabs)
    // Note this is really inefficient, effectively a loop within a loop. O(n^2).
    const uniqueViews = allViews.filter(
      (view, index, arr) => arr.findIndex(v => v.viewId === view.viewId) === index,
    );
    // Map views to DashboardItem containers
    const infoViews = uniqueViews.map(view => {
      const uniqueViewId = getUniqueViewId(view);
      if (!view.requiresDataFetch) {
        return <StateDashboardItem viewContent={{ ...view }} key={uniqueViewId} />;
      }
      return (
        <DashboardItem
          viewConfig={view}
          infoViewKey={uniqueViewId}
          key={uniqueViewId}
          isSidePanelExpanded={isSidePanelExpanded}
        />
      );
    });
    return infoViews;
  }

  render() {
    const { compressed } = this.props;
    const GridWrapper = compressed ? GridCompressed : Grid;

    return (
      <GridWrapper
        data-testid="dashboard-group"
        innerRef={gridElement => {
          this.gridElement = gridElement;
        }}
      >
        {this.renderDashboardItems()}
      </GridWrapper>
    );
  }
}

DashboardGroup.propTypes = {
  tab: PropTypes.object,
  compressed: PropTypes.bool,
  isSidePanelExpanded: PropTypes.bool,
};

DashboardGroup.defaultProps = {
  tab: null,
  compressed: false,
  isSidePanelExpanded: false,
};
