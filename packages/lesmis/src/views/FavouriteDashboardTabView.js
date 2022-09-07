/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import { FlexStart } from '@tupaia/ui-components';
import { useDashboardData } from '../api/queries';
import { useStickyBar, useDashboardDropdownOptions } from '../utils';
import { DashboardSearch } from '../components/DashboardSearch';
import FavouriteDashboardView from './FavouriteDashboardView';

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

const getDropDownOptionsWithFavouriteDashboardItems = (data = []) => {
  const { dropdownOptions } = useDashboardDropdownOptions();
  const favouriteDropdownOption = dropdownOptions.find(({ value }) => value === 'favourites');
  const otherDropdownOptions = dropdownOptions.filter(({ value }) => value !== 'favourites');
  const subDashboardsWithFavouriteDashboardItems = data.filter(
    favouriteDropdownOption.componentProps.filterSubDashboards,
  );

  const filteredDropdownOptions = otherDropdownOptions.map(dropdownOption => {
    const { filterSubDashboards } = dropdownOption.componentProps;
    const subDashboards = subDashboardsWithFavouriteDashboardItems.filter(filterSubDashboards);

    return { ...dropdownOption, subDashboards };
  });

  return filteredDropdownOptions.filter(dropdownOption => dropdownOption.subDashboards.length > 0);
};

export const FavouriteDashboardTabView = ({ entityCode, TabBarLeftSection, year }) => {
  const dashboardsRef = useRef(null);
  const [searchIsActive, setSearchIsActive] = useState(false);

  const { isScrolledPastTop, scrollToTop } = useStickyBar(dashboardsRef);
  const { data, isLoading, isError, error } = useDashboardData({
    entityCode,
    includeDrillDowns: false,
  });
  const dropdownOptions = getDropDownOptionsWithFavouriteDashboardItems(data);

  const getResultsEl = () => {
    return dashboardsRef;
  };

  const onToggleSearch = isActive => {
    setSearchIsActive(isActive);
  };

  return (
    <div ref={dashboardsRef}>
      <FlexStart>
        <DashboardSearch getResultsEl={getResultsEl} onToggleSearch={onToggleSearch} />
        <TabBarLeftSection />
      </FlexStart>

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
      {isScrolledPastTop && <ScrollToTopButton onClick={scrollToTop} />}
    </div>
  );
};

FavouriteDashboardTabView.propTypes = {
  entityCode: PropTypes.string.isRequired,
  TabBarLeftSection: PropTypes.func.isRequired,
  year: PropTypes.string,
};

FavouriteDashboardTabView.defaultProps = {
  year: null,
};
