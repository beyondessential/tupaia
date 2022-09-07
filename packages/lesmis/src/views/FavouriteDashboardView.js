/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import {
  FetchLoader,
  TabsLoader,
  FlexColumn,
  TabBar,
  Tabs,
  Tab as BaseTab,
  TabBarSection as BaseTabBarSection,
} from '../components';
import { NAVBAR_HEIGHT_INT } from '../constants';
import DashboardItemsView from './DashboardItemsView';
import { useDefaultDashboardTab } from '../utils';

const TabBarSection = styled(BaseTabBarSection)`
  min-height: 3.5rem;
  padding-right: 2rem;
`;

const Tab = styled(BaseTab)`
  padding: 1rem 0;
`;

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

const FavouriteDashboardView = ({
  subDashboards,
  label,
  searchIsActive,
  isLoading,
  year,
  isError,
  error,
}) => {
  const [selectedSubDashboard, setSelectedSubDashboard] = useState(
    useDefaultDashboardTab(null, subDashboards),
  );

  const activeSubDashboard = useDefaultDashboardTab(selectedSubDashboard, subDashboards);

  const handleChangeSubDashboard = (event, newValue) => {
    setSelectedSubDashboard(newValue);
  };

  return (
    <div>
      <StickyTabBarContainer>
        <TabBar>
          {isLoading ? (
            <TabsLoader />
          ) : (
            <>
              <TabBarSection>{label}</TabBarSection>
              <Tabs
                value={activeSubDashboard}
                onChange={handleChangeSubDashboard}
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
      <DashboardSection>
        <FetchLoader
          isLoading={isLoading && !searchIsActive}
          isError={isError && !searchIsActive}
          error={error}
        >
          <DashboardItemsView
            subDashboards={subDashboards}
            searchIsActive={searchIsActive}
            activeSubDashboard={activeSubDashboard}
            year={year}
            isFavouriteDashboardItemsOnly
          />
        </FetchLoader>
      </DashboardSection>
    </div>
  );
};

export default FavouriteDashboardView;

FavouriteDashboardView.propTypes = {
  subDashboards: PropTypes.array,
  label: PropTypes.string,
  searchIsActive: PropTypes.bool,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  error: PropTypes.string,
  year: PropTypes.string,
};

FavouriteDashboardView.defaultProps = {
  subDashboards: [],
  label: '',
  searchIsActive: true,
  isLoading: true,
  isError: true,
  error: '',
  year: null,
};
