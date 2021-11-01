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
import CancelIcon from '@material-ui/icons/Cancel';
import { useDashboardSearch } from './useDashboardSearch';
import { useProjectEntitiesData } from '../../api';
import { makeEntityLink } from '../../utils';

const SearchButton = styled(MuiIconButton)`
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 3px;
  transition: all 0.2s ease;

  &.active {
    background: ${props => props.theme.palette.primary.main};
    padding: 0 1.8rem;
    border-radius: 0;
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

  &.active {
    position: absolute;

    .MuiInputBase-root {
      width: 100%;
    }
  }
`;

const Input = styled(InputBase)`
  width: 0;
  padding-left: 15px;
`;

const ClearButton = styled(MuiIconButton)`
  margin: 1px 0 0 0;
  padding: 0.5rem;

  &:hover {
    background: none;
    color: ${props => props.theme.palette.primary.main};
  }

  .MuiSvgIcon-root {
    font-size: 1.1rem;
  }
`;

const DEFAULT_LIMIT = 5;
const EXPANDED_LIMIT = 200;

export const DashboardSearch = ({ linkType }) => {
  const [inputValue, setInputValue] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { data: options = [], isLoading } = useProjectEntitiesData();
  const history = useHistory();

  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    focused,
    getClearProps,
    popupOpen,
    value,
  } = useDashboardSearch({
    inputValue,
    setInputValue,
    options,
    limit: inputValue && expanded ? EXPANDED_LIMIT : DEFAULT_LIMIT,
    onChange: (event, option) => {
      if (option && option.code) {
        history.push(makeEntityLink(option.code, linkType));
      }
    },
  });

  const clearProps = getClearProps();

  const handleClear = () => {
    setExpanded(false);
    clearProps.onClick();
  };

  const handleClickSearch = () => {
    setShowSearch(isOpen => !isOpen);
  };

  return (
    <SearchContainer {...getRootProps()} elevation={0} className={showSearch ? 'active' : ''}>
      <SearchButton
        onClick={handleClickSearch}
        className={showSearch ? 'active' : ''}
        color="primary"
      >
        <MuiSearchIcon />
      </SearchButton>
      <Input placeholder="Start typing to search dashboards" inputProps={{ ...getInputProps() }} />
      {inputValue && (
        <ClearButton {...clearProps} onClick={handleClear} aria-label="clear">
          <CancelIcon />
        </ClearButton>
      )}
    </SearchContainer>
  );
};

DashboardSearch.propTypes = {
  className: PropTypes.string,
  linkType: PropTypes.oneOf(['dashboard', 'map']),
};

DashboardSearch.defaultProps = {
  className: null,
  linkType: 'dashboard',
};
