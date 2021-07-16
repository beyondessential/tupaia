/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import { SmallAlert } from '@tupaia/ui-components';
import { useDashboardData, useUser } from '../api/queries';
import {
  FetchLoader,
  TabsLoader,
  FlexCenter,
  DashboardReport,
  TabBar,
  Tabs,
  Tab,
  TabPanel,
} from '../components';
import { NAVBAR_HEIGHT_INT } from '../constants';
import { useUrlSearchParam } from '../utils';

const StickyTabBarContainer = styled.div`
  position: sticky;
  top: ${NAVBAR_HEIGHT_INT}px;
  z-index: 2;
`;

const DashboardSection = styled(FlexCenter)`
  min-height: 31rem;
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

// Utility for sticking the tab bar to the top of the page and scrolling up to the tab bar
const useStickyBar = () => {
  const topRef = useRef();
  const [isScrolledPastTop, setIsScrolledPastTop] = useState(false);
  const [stickyBarsHeight, setStickyBarsHeight] = useState(0);

  const onLoadTabBar = useCallback(tabBarNode => {
    if (tabBarNode !== null) {
      const tabBarHeight = tabBarNode.getBoundingClientRect().height;
      setStickyBarsHeight(tabBarHeight + NAVBAR_HEIGHT_INT);
    }
  }, []);

  useEffect(() => {
    const detectScrolledPastTop = () =>
      setIsScrolledPastTop(topRef.current.getBoundingClientRect().top < stickyBarsHeight);

    // detect once when the effect is run
    detectScrolledPastTop();
    // and again on scroll events
    window.addEventListener('scroll', detectScrolledPastTop);

    return () => window.removeEventListener('scroll', detectScrolledPastTop);
  }, [stickyBarsHeight]);

  const scrollToTop = useCallback(() => {
    // if the top of the dashboards container is above the sticky dashboard header, scroll to the top
    if (isScrolledPastTop) {
      const newTop = topRef.current.offsetTop - stickyBarsHeight;
      window.scrollTo({ top: newTop, behavior: 'smooth' });
    }
  }, [isScrolledPastTop, stickyBarsHeight]);

  return {
    scrollToTop,
    topRef,
    isScrolledPastTop,
    onLoadTabBar,
  };
};

export const DashboardReportTabView = ({
  entityCode,
  TabBarLeftSection,
  year,
  filterSubDashboards,
}) => {
  const [selectedDashboard, setSelectedDashboard] = useUrlSearchParam('subDashboard');
  const { data, isLoading, isError, error } = useDashboardData(entityCode);
  const { scrollToTop, topRef, isScrolledPastTop, onLoadTabBar } = useStickyBar();
  const subDashboards = useMemo(() => data?.filter(filterSubDashboards), [
    data,
    filterSubDashboards,
  ]);
  const activeDashboard = useDefaultDashboardTab(selectedDashboard, subDashboards);

  const handleChangeDashboard = (event, newValue) => {
    setSelectedDashboard(newValue);
    scrollToTop();
  };

  return (
    <>
      <StickyTabBarContainer ref={onLoadTabBar}>
        <TabBar>
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
      <DashboardSection ref={topRef}>
        <FetchLoader isLoading={isLoading} isError={isError} error={error}>
          {subDashboards?.map(dashboard => (
            <TabPanel
              key={dashboard.dashboardId}
              isSelected={dashboard.dashboardName === activeDashboard}
            >
              {(() => {
                // Todo: support other report types (including "component" types)
                const dashboardItems = dashboard.items.filter(item => item.type === 'chart');
                return dashboardItems.length > 0 ? (
                  dashboardItems.map(item => (
                    <DashboardReport
                      key={item.code}
                      name={item.name}
                      entityCode={entityCode}
                      dashboardCode={dashboard.dashboardCode}
                      dashboardName={dashboard.dashboardName}
                      reportCode={item.reportCode}
                      year={year}
                      periodGranularity={item.periodGranularity}
                      viewConfig={item}
                    />
                  ))
                ) : (
                  <SmallAlert key={dashboard.dashboardName} severity="info" variant="standard">
                    There are no reports available for this dashboard
                  </SmallAlert>
                );
              })()}
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
