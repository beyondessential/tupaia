/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FlexStart } from '@tupaia/ui-components';
import { useStickyBar, useDropdownOptionsWithFavouriteDashboardItems } from '../utils';
import { DashboardSearch } from '../components/DashboardSearch';
import FavouriteDashboardView from './FavouriteDashboardView';
import { ScrollToTopButton } from '../components';

export const FavouriteDashboardTabView = ({ TabBarLeftSection, year }) => {
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
    <div>
      <FlexStart ref={onLoadTabBar}>
        <DashboardSearch getResultsEl={getResultsEl} onToggleSearch={onToggleSearch} />
        <TabBarLeftSection />
      </FlexStart>

      <div ref={dashboardsRef}>
        {dropdownOptions.map(({ subDashboards, label }) => {
          return (
            <FavouriteDashboardView
              subDashboards={subDashboards}
              label={label}
              searchIsActive={searchIsActive}
              isLoading={isLoading}
              isError={isError}
              error={error}
              year={year}
            />
          );
        })}
      </div>
      {isScrolledPastTop && <ScrollToTopButton onClick={scrollToTop} />}
    </div>
  );
};

FavouriteDashboardTabView.propTypes = {
  TabBarLeftSection: PropTypes.func.isRequired,
  year: PropTypes.string,
};

FavouriteDashboardTabView.defaultProps = {
  year: null,
};
