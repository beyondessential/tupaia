import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiPaper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import MuiIconButton from '@material-ui/core/IconButton';
import MuiSearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import { useDashboardData } from '../../api';
import {
  useI18n,
  usePortal,
  useUrlParams,
  useAutocomplete,
  useDashboardDropdownOptions,
} from '../../utils';
import { DashboardSearchResults } from './DashboardSearchResults';

// Setting the button size directly allows a smooth animation
const BUTTON_SIZE = '50px';
const EXPANDED_BUTTON_SIZE = '90px';

const SearchButton = styled(MuiIconButton)`
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 3px;
  height: ${BUTTON_SIZE};
  width: ${BUTTON_SIZE};
  transition: height 0.1s ease, width 0.1s ease, margin 0.1s ease;

  .MuiSvgIcon-root {
    font-size: 1.8rem;
  }

  &.active {
    height: ${EXPANDED_BUTTON_SIZE};
    width: ${EXPANDED_BUTTON_SIZE};
    margin-left: ${props => props.theme.spacing(-3)}px;
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
    padding-left: ${props => props.theme.spacing(3)}px;
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

const useDashboardItems = () => {
  const { getProfileLabel } = useI18n();
  const { entityCode } = useUrlParams();
  const { otherDropdownOptions } = useDashboardDropdownOptions();

  const { data } = useDashboardData({
    entityCode,
    includeDrillDowns: false,
  });

  if (!data) {
    return [];
  }

  return data.reduce((allItems, { dashboardName, entityName, entityType, ...dashboard }) => {
    const subDashboard = otherDropdownOptions.find(option =>
      dashboard.dashboardCode.startsWith(`LESMIS_${option.value}`),
    );

    const items = dashboard.items.map(item => ({
      ...item,
      subDashboardName: subDashboard ? subDashboard.label : getProfileLabel(entityType),
      dashboardName,
      entityName,
    }));

    return [...allItems, ...items];
  }, []);
};

const LIMIT = 50;

export const DashboardSearch = ({ onToggleSearch, getResultsEl }) => {
  const [inputValue, setInputValue] = useState('');
  const [isActive, setIsActive] = useState(false);
  const options = useDashboardItems();

  const resetSearch = () => {
    onToggleSearch(false);
    setIsActive(false);
    setInputValue('');
  };

  const autocompleteResponse = useAutocomplete({
    id: 'dashboard-search',
    inputValue,
    setInputValue,
    options,
    limit: LIMIT,
    onChange: (event, option, reason) => {
      if (reason === 'select-option' && option && option.code) {
        resetSearch();
      }
    },
    muiProps: {
      debug: true, // Keeps the options in memory after blur event
      onClose: (event, reason) => {
        if (reason === 'escape') {
          resetSearch();
        }
      },
    },
  });

  const { getRootProps, getInputProps, getClearProps } = autocompleteResponse;

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
    <DashboardSearchResults isActive={isActive} autocompleteResponse={autocompleteResponse} />,
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
};
