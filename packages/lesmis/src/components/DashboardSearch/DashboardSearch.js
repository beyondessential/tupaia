/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import MuiPaper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import MuiIconButton from '@material-ui/core/IconButton';
import MuiSearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import { useDashboardData } from '../../api';
import { makeEntityLink, usePortal, useUrlParams, useAutocomplete } from '../../utils';
import { DashboardSearchResults } from './DashboardSearchResults';

const SearchButton = styled(MuiIconButton)`
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 3px;
  height: 50px;
  width: 50px;
  transition: height 0.1s ease, width 0.1s ease, margin 0.1s ease;

  .MuiSvgIcon-root {
    font-size: 1.8rem;
  }

  &.active {
    height: 90px;
    width: 90px;
    margin-left: -24px;
    background: ${props => props.theme.palette.primary.main};
    border-radius: 0;
    border: none;
    color: white;

    &:hover {
      background: ${props => props.theme.palette.primary.main};
    }
  }
`;

const SearchContainer = styled(MuiPaper)`
  display: flex;
  align-items: center;
  top: 1px;
  right: 0;
  left: 0;
  bottom: 1px;
  z-index: 1;
  border-radius: 0;
  background: white;
  padding-right: 15px;

  &.active {
    position: absolute;
    padding-left: 24px;
  }
`;

const Input = styled(InputBase)`
  width: 0;

  &.active {
    width: 100%;
    padding-left: 15px;
  }
`;

const ClearButton = styled(MuiIconButton)`
  align-self: center;
  width: 50px;
  height: 50px;
  background-color: rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const LIMIT = 50;

const useDashboardItems = () => {
  const { entityCode } = useUrlParams();

  const { data } = useDashboardData({
    entityCode,
    includeDrillDowns: false,
  });

  if (!data) {
    return [];
  }

  return data.reduce((allItems, { dashboardName, entityName, ...dashboard }) => {
    const items = dashboard.items.map(item => ({ ...item, dashboardName, entityName }));
    return [...allItems, ...items];
  }, []);
};

export const DashboardSearch = ({ linkType, onToggleSearch, getResultsEl, year }) => {
  const [inputValue, setInputValue] = useState('');
  const [isActive, setIsActive] = useState(false);
  const options = useDashboardItems();
  const history = useHistory();

  const searchResults = useAutocomplete({
    id: 'dashboard-search',
    inputValue,
    setInputValue,
    options,
    limit: LIMIT,
    onChange: (event, option) => {
      if (option && option.code) {
        history.push(makeEntityLink(option.code, linkType));
      }
    },
    muiProps: {
      debug: true, // Keeps the options in memory after blur event
    },
  });

  const { getRootProps, getInputProps, getClearProps } = searchResults;

  const clearProps = getClearProps();

  const handleClickClear = () => {
    if (inputValue) {
      clearProps.onClick();
    } else {
      onToggleSearch(false);
      setIsActive(false);
    }
  };

  const handleClickSearch = () => {
    onToggleSearch(!isActive);
    setIsActive(!isActive);
    setInputValue('');
  };

  const SearchResults = usePortal(
    <DashboardSearchResults isActive={isActive} searchResults={searchResults} year={year} />,
    getResultsEl,
  );

  return (
    <>
      {SearchResults}
      <SearchContainer {...getRootProps()} elevation={0} className={isActive ? 'active' : ''}>
        <SearchButton
          onClick={handleClickSearch}
          className={isActive ? 'active' : ''}
          color="primary"
        >
          <MuiSearchIcon />
        </SearchButton>
        <Input
          className={isActive ? 'active' : ''}
          placeholder="Start typing to search dashboards"
          inputProps={{ ...getInputProps() }}
        />
        {isActive && (
          <ClearButton {...clearProps} onClick={handleClickClear} aria-label="clear">
            <CloseIcon />
          </ClearButton>
        )}
      </SearchContainer>
    </>
  );
};

DashboardSearch.propTypes = {
  getResultsEl: PropTypes.func.isRequired,
  onToggleSearch: PropTypes.func.isRequired,
  linkType: PropTypes.oneOf(['dashboard', 'map']),
  year: PropTypes.string,
};

DashboardSearch.defaultProps = {
  linkType: 'dashboard',
  year: null,
};
