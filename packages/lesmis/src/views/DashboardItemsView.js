import { SmallAlert } from '@tupaia/ui-components';
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { yearToApiDates } from '../api/queries/utils';
import { DashboardReport, PanelComponent, TabPanel } from '../components';

const InfoAlert = styled(SmallAlert)`
  margin: auto;
`;

const DashboardItemsView = ({
  subDashboards,
  searchIsActive,
  activeSubDashboard,
  year,
  isFavouriteDashboardItemsOnly,
}) => {
  const { startDate, endDate } = yearToApiDates(year);

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
                  reportCode={item.reportCode}
                  name={item.name}
                  startDate={startDate}
                  endDate={endDate}
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
  year: PropTypes.string,
  activeSubDashboard: PropTypes.string,
  isFavouriteDashboardItemsOnly: PropTypes.bool,
};

DashboardItemsView.defaultProps = {
  year: null,
  activeSubDashboard: null,
  isFavouriteDashboardItemsOnly: false,
};
