import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import {
  FetchLoader,
  TabsLoader,
  FlexColumn,
  TabBar as BaseTabBar,
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

const TabBar = styled(BaseTabBar)`
  margin-top: -1px;
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
  isLoading,
  isError,
  error,
  useYearSelector,
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
        <FetchLoader isLoading={isLoading} isError={isError} error={error}>
          <DashboardItemsView
            subDashboards={subDashboards}
            activeSubDashboard={activeSubDashboard}
            useYearSelector={useYearSelector}
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
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  useYearSelector: PropTypes.bool,
  error: PropTypes.string,
};

FavouriteDashboardView.defaultProps = {
  subDashboards: [],
  label: '',
  isLoading: true,
  isError: true,
  useYearSelector: false,
  error: '',
};
