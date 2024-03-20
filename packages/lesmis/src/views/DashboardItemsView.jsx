import { SmallAlert } from '@tupaia/ui-components';
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { DashboardReport, PanelComponent, TabPanel } from '../components';

const InfoAlert = styled(SmallAlert)`
  margin: auto;
`;

const DashboardItemsView = ({
  subDashboards,
  searchIsActive,
  activeSubDashboard,
  useYearSelector,
  isFavouriteDashboardItemsOnly,
}) => {
  return (
    <>
      {subDashboards?.map(subDashboard => (
        <TabPanel
          className={searchIsActive ? 'active' : ''}
          Panel={PanelComponent}
          key={subDashboard.dashboardId}
          isSelected={subDashboard.dashboardName === activeSubDashboard}
        >
          {subDashboard.items.length > 0 ? (
            subDashboard.items
              .filter(
                item =>
                  !isFavouriteDashboardItemsOnly ||
                  (isFavouriteDashboardItemsOnly && item.isFavourite),
              )
              .map(item => (
                <DashboardReport
                  key={item.code}
                  itemCode={item.code}
                  reportCode={item.reportCode}
                  name={item.name}
                  useYearSelector={useYearSelector}
                  periodGranularity={item.periodGranularity}
                />
              ))
          ) : (
            <InfoAlert key={subDashboard.dashboardName} severity="info" variant="standard">
              There are no reports available for this dashboard
            </InfoAlert>
          )}
        </TabPanel>
      ))}
    </>
  );
};

export default DashboardItemsView;

DashboardItemsView.propTypes = {
  subDashboards: PropTypes.array.isRequired,
  searchIsActive: PropTypes.bool.isRequired,
  activeSubDashboard: PropTypes.string,
  isFavouriteDashboardItemsOnly: PropTypes.bool,
  useYearSelector: PropTypes.bool,
};

DashboardItemsView.defaultProps = {
  activeSubDashboard: null,
  isFavouriteDashboardItemsOnly: false,
  useYearSelector: false,
};
