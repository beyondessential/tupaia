import { SmallAlert } from '@tupaia/ui-components';
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { yearToApiDates } from '../api/queries/utils';
import { DashboardReport, FlexColumn, TabPanel } from '../components';

const InfoAlert = styled(SmallAlert)`
  margin: auto;
`;

const PanelComponent = styled(FlexColumn)`
  position: relative;
  flex: 1;
  justify-content: flex-start;
  padding: 2rem;
  margin-bottom: 2rem;
  max-width: 100%;

  &.active {
    position: absolute;
    opacity: 0;
    z-index: -1;
    height: 0;
    overflow: hidden;
  }
`;

const DashboardItemsView = ({ subDashboards, searchIsActive, activeDashboard, year }) => {
  const { startDate, endDate } = yearToApiDates(year);

  return (
    <>
      {subDashboards?.map(subDashboard => (
        <TabPanel
          className={searchIsActive ? 'active' : ''}
          Panel={PanelComponent}
          key={subDashboard.dashboardId}
          isSelected={subDashboard.dashboardName === activeDashboard}
        >
          {subDashboard.items.length > 0 ? (
            subDashboard.items.map(item => (
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
  activeDashboard: PropTypes.string,
};

DashboardItemsView.defaultProps = {
  year: null,
  activeDashboard: null,
};
