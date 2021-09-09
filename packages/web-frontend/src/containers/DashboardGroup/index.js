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
import { getUniqueViewId } from '../../utils';

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

    const { dashboardCode, entityCode: organisationUnitCode, project } = tab;

    const drillDownItemCodes = tab.items
      .filter(view => !!view.drillDown?.itemCode)
      .map(view => view.drillDown?.itemCode);
    // Map views to DashboardItem containers
    const infoViews = tab.items
      .filter(view => !drillDownItemCodes.includes(view.code))
      .map(view => {
        const uniqueViewId = getUniqueViewId(organisationUnitCode, dashboardCode, view.code);
        if (view.noDataFetch) {
          return <StateDashboardItem viewContent={{ ...view }} key={uniqueViewId} />;
        }

        return (
          <DashboardItem
            viewConfig={{
              ...view,
              project,
              dashboardCode,
              organisationUnitCode,
            }}
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
