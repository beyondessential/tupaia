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

const SearchBox = styled(MuiPaper)`
  position: absolute;
  display: flex;
  height: 100%;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 1;
  border-radius: 0;
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const SearchButton = styled(MuiIconButton)`
  background: ${props => props.theme.palette.primary.main};
  border-radius: 0;
  padding: 0 1.8rem;
  color: white;

  .MuiSvgIcon-root {
    font-size: 1.8rem;
  }

  &:hover {
    background: ${props => props.theme.palette.primary.main};
  }
`;

const Input = styled(InputBase)`
  width: 100%;
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

export const DashboardSearch = ({ linkType, className }) => {
  const history = useHistory();
  const [inputValue, setInputValue] = useState('');
  const [expanded, setExpanded] = useState(false);
  const { data: options = [], isLoading } = useProjectEntitiesData();

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

  return (
    <SearchBox {...getRootProps()} elevation={0} className={className}>
      <SearchButton>
        <MuiSearchIcon />
      </SearchButton>
      <Input placeholder="Start typing to search dashboards" inputProps={{ ...getInputProps() }} />
      {inputValue && (
        <ClearButton {...clearProps} onClick={handleClear} aria-label="clear">
          <CancelIcon />
        </ClearButton>
      )}
    </SearchBox>
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
