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
import { useDashboardSearch } from './useDashboardSearch';
import { useDashboardData } from '../../api';
import { makeEntityLink, useUrlParams } from '../../utils';
import { usePortal } from './usePortal';
import { DashboardSearchResults } from './DashboardSearchResult';

const SearchButton = styled(MuiIconButton)`
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 3px;
  transition: all 0.2s ease;

  &.active {
    background: ${props => props.theme.palette.primary.main};
    padding: 0 1.8rem;
    border-radius: 0;
    border: none;
    color: white;

    .MuiSvgIcon-root {
      font-size: 1.8rem;
    }

    &:hover {
      background: ${props => props.theme.palette.primary.main};
    }
  }
`;

const SearchContainer = styled(MuiPaper)`
  display: flex;
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

  return data.reduce((allItems, dashboard) => {
    return [...allItems, ...dashboard.items];
  }, []);
};

export const DashboardSearch = ({ linkType, onToggleSearch, getResultsEl }) => {
  const [inputValue, setInputValue] = useState('');
  const [isActive, setIsActive] = useState(false);
  const options = useDashboardItems();
  const history = useHistory();

  const searchResults = useDashboardSearch({
    inputValue,
    setInputValue,
    options,
    limit: LIMIT,
    onChange: (event, option) => {
      if (option && option.code) {
        history.push(makeEntityLink(option.code, linkType));
      }
    },
  });

  const { getRootProps, getInputProps, getClearProps } = searchResults;

  const clearProps = getClearProps();

  const handleClear = () => {
    clearProps.onClick();
  };

  const handleClickSearch = () => {
    onToggleSearch(!isActive);
    setIsActive(!isActive);
  };

  const SearchResults = usePortal(
    <DashboardSearchResults isActive={isActive} searchResults={searchResults} />,
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
        {inputValue && isActive && (
          <ClearButton {...clearProps} onClick={handleClear} aria-label="clear">
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
};

DashboardSearch.defaultProps = {
  linkType: 'dashboard',
};
