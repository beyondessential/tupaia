/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useDashboardData } from '../api/queries';
import {
  FetchLoader,
  TabsLoader,
  FlexColumn,
  TabBar,
  Tabs,
  Tab,
  TabPanel,
  ScrollToTopButton,
} from '../components';
import { NAVBAR_HEIGHT_INT } from '../constants';
import { useUrlSearchParam, useStickyBar, useDefaultDashboardTab } from '../utils';
import { DashboardSearch } from '../components/DashboardSearch';
import DashboardItemsView from './DashboardItemsView';

const StickyTabBarContainer = styled.div`
  position: sticky;
  top: ${NAVBAR_HEIGHT_INT}px;
  z-index: 2;
`;

const DashboardSection = styled(FlexColumn)`
  align-items: center;
  justify-content: flex-start;
  min-height: 40rem;
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

export const DashboardReportTabView = ({
  entityCode,
  TabBarLeftSection,
  year,
  filterSubDashboards,
}) => {
  const dashboardsRef = useRef(null);
  const [searchIsActive, setSearchIsActive] = useState(false);
  const [selectedSubDashboard, setSelectedSubDashboard] = useUrlSearchParam('subDashboard');
  const { data, isLoading, isError, error } = useDashboardData({
    entityCode,
    includeDrillDowns: false,
  });
  const { scrollToTop, isScrolledPastTop, onLoadTabBar } = useStickyBar(dashboardsRef);
  const subDashboards = useMemo(() => data?.filter(filterSubDashboards), [
    data,
    filterSubDashboards,
  ]);
  const activeSubDashboard = useDefaultDashboardTab(selectedSubDashboard, subDashboards);

  const getResultsEl = () => {
    return dashboardsRef;
  };

  const handleChangeDashboard = (event, newValue) => {
    setSelectedSubDashboard(newValue);
    scrollToTop();
  };

  const onToggleSearch = isActive => {
    setSearchIsActive(isActive);
  };

  return (
    <>
      <StickyTabBarContainer ref={onLoadTabBar}>
        <TabBar>
          <DashboardSearch getResultsEl={getResultsEl} onToggleSearch={onToggleSearch} />
          <TabBarLeftSection />
          {isLoading ? (
            <TabsLoader />
          ) : (
            <>
              <Tabs
                value={activeSubDashboard}
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
        <FetchLoader
          isLoading={isLoading && !searchIsActive}
          isError={isError && !searchIsActive}
          error={error}
        >
          {subDashboards?.map(dashboard => (
            <TabPanel
              className={searchIsActive ? 'active' : ''}
              Panel={PanelComponent}
              key={dashboard.dashboardId}
              isSelected={dashboard.dashboardName === activeSubDashboard}
            >
              <DashboardItemsView
                subDashboards={subDashboards}
                searchIsActive={searchIsActive}
                activeSubDashboard={activeSubDashboard}
                year={year}
              />
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
