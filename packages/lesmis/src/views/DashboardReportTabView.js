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
import { useDashboardData, useUser } from '../api/queries';
import {
  FetchLoader,
  TabsLoader,
  FlexColumn,
  TabBar,
  Tabs,
  Tab,
  TabPanel,
  useI18n,
} from '../components';
import { NAVBAR_HEIGHT_INT } from '../constants';
import { useHomeUrl, useUrlSearchParam, useStickyBar } from '../utils';
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

// Gets the best default dashboard possible, and check if the selected dashboard is valid
const useDefaultDashboardTab = (selectedDashboard = null, options) => {
  const history = useHistory();
  const { translate } = useI18n();
  const { homeUrl } = useHomeUrl();
  const { isLoggedIn, isFetching: isFetchingUser } = useUser();
  const defaultDashboardGroup = translate('dashboards.studentEnrolment');
  const schoolDefaultDashboardGroup = 'Students';

  if (!options || options.length === 0) {
    return null;
  }

  const dashboardNames = options.map(d => d.dashboardName);

  if (selectedDashboard) {
    if (dashboardNames.includes(selectedDashboard)) {
      return selectedDashboard;
    }
    if (!isFetchingUser && !isLoggedIn) {
      return history.push(`${homeUrl}/login`, { referer: history.location });
    }
  }

  if (dashboardNames.includes(defaultDashboardGroup)) {
    return defaultDashboardGroup;
  }
  if (dashboardNames.includes(schoolDefaultDashboardGroup)) {
    return schoolDefaultDashboardGroup;
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
              isSelected={dashboard.dashboardName === activeDashboard}
            >
              <DashboardItemsView
                subDashboards={subDashboards}
                searchIsActive={searchIsActive}
                activeDashboard={activeDashboard}
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
