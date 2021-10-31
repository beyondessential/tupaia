/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import DashboardItem from './DashboardItem';
import StateDashboardItem from './StateDashboardItem';
import { getUniqueViewId } from '../utils';

const Container = styled.div`
  &.collapsed {
    display: block;
    > div {
      margin-bottom: 5px;
    }
  }

  &.expanded {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 10px;
    row-gap: 10px;
    padding-left: 10px;
    padding-right: 10px;
    padding-bottom: 10px;
  }
`;

export const DashboardGroup = ({ tab, isSidePanelExpanded }) => {
  if (!tab) return null;

  const { dashboardCode, entityCode: organisationUnitCode, project } = tab;

  const drillDownItemCodes = tab.items
    .filter(view => !!view.drillDown?.itemCode)
    .map(view => view.drillDown?.itemCode);

  return (
    <Container className={isSidePanelExpanded ? 'expanded' : 'collapsed'}>
      {tab.items
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
        })}
    </Container>
  );
};

DashboardGroup.propTypes = {
  tab: PropTypes.object,
  isSidePanelExpanded: PropTypes.bool,
};

DashboardGroup.defaultProps = {
  tab: null,
  isSidePanelExpanded: false,
};
