import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { useStickyBar, useDropdownOptionsWithFavouriteDashboardItems } from '../utils';
import FavouriteDashboardView from './FavouriteDashboardView';
import { FlexColumn, ScrollToTopButton, TabBar, DashboardSearch } from '../components';
import NoFavouritesView from './NoFavouritesView';

const TabBarContainer = styled.div`
  z-index: 3;
  position: relative;
`;

const DashboardSection = styled(FlexColumn)`
  justify-content: flex-start;
  min-height: 40rem;
`;

export const FavouriteDashboardTabView = ({ TabBarLeftSection }) => {
  const dashboardsRef = useRef(null);
  const [searchIsActive, setSearchIsActive] = useState(false);
  const { isScrolledPastTop, scrollToTop, onLoadTabBar } = useStickyBar(dashboardsRef);
  const {
    dropdownOptionsWithFavouriteDashboardItems: dropdownOptions,
    isLoading,
    isError,
    error,
  } = useDropdownOptionsWithFavouriteDashboardItems();

  const getResultsEl = () => {
    return dashboardsRef;
  };

  const onToggleSearch = isActive => {
    setSearchIsActive(isActive);
  };

  return (
    <>
      <TabBarContainer ref={onLoadTabBar}>
        {(!isScrolledPastTop || searchIsActive) && (
          <TabBar>
            <DashboardSearch getResultsEl={getResultsEl} onToggleSearch={onToggleSearch} />
            <TabBarLeftSection />
          </TabBar>
        )}
      </TabBarContainer>
      <DashboardSection ref={dashboardsRef}>
        {!searchIsActive && dropdownOptions.length === 0 && <NoFavouritesView />}
        {!searchIsActive &&
          dropdownOptions?.map(({ value, subDashboards, label, useYearSelector }) => (
            <FavouriteDashboardView
              key={value}
              subDashboards={subDashboards}
              label={label}
              isLoading={isLoading}
              isError={isError}
              error={error}
              useYearSelector={useYearSelector}
            />
          ))}
      </DashboardSection>

      {isScrolledPastTop && <ScrollToTopButton onClick={scrollToTop} />}
    </>
  );
};

FavouriteDashboardTabView.propTypes = {
  TabBarLeftSection: PropTypes.func.isRequired,
};
