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
  PanelComponent,
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

export const DashboardReportTabView = ({
  entityCode,
  TabBarLeftSection,
  filterSubDashboards,
  useYearSelector,
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
                useYearSelector={useYearSelector}
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
  filterSubDashboards: PropTypes.func.isRequired,
  useYearSelector: PropTypes.bool,
};

DashboardReportTabView.defaultProps = {
  useYearSelector: false,
};
