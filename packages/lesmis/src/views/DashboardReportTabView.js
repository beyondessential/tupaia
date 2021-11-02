/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import { SmallAlert } from '@tupaia/ui-components';
import { useDashboardData, useUser } from '../api/queries';
import {
  FetchLoader,
  TabsLoader,
  FlexColumn,
  DashboardReport,
  TabBar,
  Tabs,
  Tab,
  TabPanel,
} from '../components';
import { NAVBAR_HEIGHT_INT } from '../constants';
import { useUrlSearchParam, useStickyBar } from '../utils';
import { yearToApiDates } from '../api/queries/utils';
import { DashboardSearch } from '../components/DashboardSearch';

const StickyTabBarContainer = styled.div`
  position: sticky;
  top: ${NAVBAR_HEIGHT_INT}px;
  z-index: 2;
`;

const DashboardSection = styled(FlexColumn)`
  align-items: center;
  justify-content: flex-start;
  min-height: calc(100vh - 200px);
`;

const ScrollToTopButton = styled(ArrowUpward)`
  position: fixed;
  bottom: 29px;
  right: 32px;
  cursor: pointer;
  font-size: 50px;
  color: white;
  padding: 10px;
  background: ${props => props.theme.palette.text.primary};
  border-radius: 3px;
`;

const PanelComponent = styled(FlexColumn)`
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

const DEFAULT_DASHBOARD_GROUP = 'Student Enrolment';
const SCHOOL_DEFAULT_DASHBOARD_GROUP = 'Students';

// Gets the best default dashboard possible, and check if the selected dashboard is valid
const useDefaultDashboardTab = (selectedDashboard = null, options) => {
  const history = useHistory();
  const { isLoggedIn, isFetching: isFetchingUser } = useUser();

  if (!options || options.length === 0) {
    return null;
  }

  const dashboardNames = options.map(d => d.dashboardName);

  if (selectedDashboard) {
    if (dashboardNames.includes(selectedDashboard)) {
      return selectedDashboard;
    }
    if (!isFetchingUser && !isLoggedIn) {
      return history.push('/login', { referer: history.location });
    }
  }

  if (dashboardNames.includes(DEFAULT_DASHBOARD_GROUP)) {
    return DEFAULT_DASHBOARD_GROUP;
  }
  if (dashboardNames.includes(SCHOOL_DEFAULT_DASHBOARD_GROUP)) {
    return SCHOOL_DEFAULT_DASHBOARD_GROUP;
  }
  return dashboardNames[0];
};

export const DashboardReportTabView = ({
  entityCode,
  TabBarLeftSection,
  year,
  filterSubDashboards,
}) => {
  const dashboardsRef = useRef(null);
  const [searchIsActive, setSearchIsActive] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useUrlSearchParam('subDashboard');
  const { data, isLoading, isError, error } = useDashboardData({
    entityCode,
    includeDrillDowns: false,
  });
  const { scrollToTop, isScrolledPastTop, onLoadTabBar } = useStickyBar(dashboardsRef);
  const subDashboards = useMemo(() => data?.filter(filterSubDashboards), [
    data,
    filterSubDashboards,
  ]);
  const activeDashboard = useDefaultDashboardTab(selectedDashboard, subDashboards);

  const getResultsEl = () => {
    return dashboardsRef;
  };

  const handleChangeDashboard = (event, newValue) => {
    setSelectedDashboard(newValue);
    scrollToTop();
  };

  const onToggleSearch = isActive => {
    setSearchIsActive(isActive);
  };

  const { startDate, endDate } = yearToApiDates(year);

  return (
    <>
      <StickyTabBarContainer ref={onLoadTabBar}>
        <TabBar>
          <DashboardSearch
            getResultsEl={getResultsEl}
            onToggleSearch={onToggleSearch}
            year={year}
          />
          <TabBarLeftSection />
          {isLoading ? (
            <TabsLoader />
          ) : (
            <>
              <Tabs
                value={activeDashboard}
                onChange={handleChangeDashboard}
                variant="scrollable"
                scrollButtons="auto"
              >
                {subDashboards?.map(({ dashboardName: heading, dashboardId }) => (
                  <Tab key={dashboardId} label={heading} value={heading} />
                ))}
              </Tabs>
            </>
          )}
        </TabBar>
      </StickyTabBarContainer>
      <DashboardSection ref={dashboardsRef}>
        <FetchLoader isLoading={isLoading} isError={isError} error={error}>
          {subDashboards?.map(dashboard => (
            <TabPanel
              className={searchIsActive ? 'active' : ''}
              Panel={PanelComponent}
              key={dashboard.dashboardId}
              isSelected={dashboard.dashboardName === activeDashboard}
            >
              {dashboard.items.length > 0 ? (
                dashboard.items.map(item => (
                  <DashboardReport
                    key={item.code}
                    reportCode={item.reportCode}
                    name={item.name}
                    startDate={startDate}
                    endDate={endDate}
                  />
                ))
              ) : (
                <SmallAlert key={dashboard.dashboardName} severity="info" variant="standard">
                  There are no reports available for this dashboard
                </SmallAlert>
              )}
            </TabPanel>
          ))}
        </FetchLoader>
      </DashboardSection>
      {isScrolledPastTop && <ScrollToTopButton onClick={scrollToTop} />}
    </>
  );
};

DashboardReportTabView.propTypes = {
  entityCode: PropTypes.string.isRequired,
  TabBarLeftSection: PropTypes.func.isRequired,
  year: PropTypes.string,
  filterSubDashboards: PropTypes.func.isRequired,
};

DashboardReportTabView.defaultProps = {
  year: null,
};
