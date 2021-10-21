/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link, useHistory } from 'react-router-dom';
import MuiButton from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import MuiPaper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import MuiDivider from '@material-ui/core/Divider';
import MuiIconButton from '@material-ui/core/IconButton';
import MuiSearchIcon from '@material-ui/icons/Search';
import CancelIcon from '@material-ui/icons/Cancel';
import Fade from '@material-ui/core/Fade';
import { EntityMenu } from '../EntityMenu';
import { useI18n } from '../I18n';
import { useAutocomplete } from './useAutocomplete';
import { useProjectEntitiesData } from '../../api';
import { getPlaceIcon, getOptionText, makeEntityLink } from '../../utils';

const SearchContainer = styled.div`
  position: relative;
  width: 24rem;
`;

const SearchBox = styled(MuiPaper)`
  display: flex;
  align-items: center;
  border-radius: 2.6rem;
  height: 2.8rem;
`;

const Input = styled(InputBase)`
  flex: 1;
`;

const SearchIcon = styled(MuiSearchIcon)`
  margin: 0 0.375rem 0 0.5rem;
  font-size: 1.3rem;
`;

const ClearButton = styled(MuiIconButton)`
  padding: 0.5rem;

  &:hover {
    background: none;
    color: ${props => props.theme.palette.primary.main};
  }

  .MuiSvgIcon-root {
    font-size: 1.1rem;
  }
`;

const Divider = styled(MuiDivider)`
  height: 1.125rem;
  background: ${props => props.theme.palette.text.tertiary};
`;

const OutlinedButton = styled(MuiButton)`
  margin-top: 0.375rem;
  padding: 0.8rem 1.25rem;
  font-weight: bold;
  font-size: 0.9rem;
  line-height: 1.2;

  &:hover {
    background: ${props => props.theme.palette.primary.light};
    border-color: ${props => props.theme.palette.primary.light};
  }
`;

const ResultsBox = styled(MuiPaper)`
  position: absolute;
  padding: 0 0.9rem 0.9rem;
  margin: 0.5rem 0 0;
  list-style: none;
  overflow: auto;
  max-height: 25rem;
  border-radius: 4px;
  width: 100%;
  z-index: 1;
`;

const ResultsItem = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.9rem;
  margin-left: -0.9rem;
  margin-right: -0.9rem;
  text-decoration: none;

  & span {
    flex: 1;
    font-size: 1rem;
    line-height: 1.4;
    color: ${props => props.theme.palette.text.primary};
  }

  & svg {
    width: 2.8rem;
    margin-right: 0.625rem;
  }

  &[data-focus='true'] {
    background-color: ${props => props.theme.palette.grey['100']};
    cursor: pointer;
  }
`;

const NoResultsBox = styled(ResultsBox)`
  text-align: center;
  padding: 1.5rem 1rem 2rem;

  img {
    width: 4.375rem;
    margin-bottom: 0.625rem;
  }
`;

const NoResultsText = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  margin-bottom: 0.625rem;
  font-size: 0.875rem;
`;

const NoResultsValue = styled.div`
  font-weight: 700;
`;

const DEFAULT_LIMIT = 5;
const EXPANDED_LIMIT = 200;

export const SearchBar = ({ linkType, className }) => {
  const history = useHistory();
  const { translate } = useI18n();
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
  } = useAutocomplete({
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

  const showExpandButton = !expanded && inputValue && groupedOptions.length === DEFAULT_LIMIT;
  const showNoResults = popupOpen && inputValue && focused && (!value || inputValue !== value.name);

  return (
    <Fade in={!isLoading}>
      <SearchContainer className={className}>
        <SearchBox {...getRootProps()} elevation={0}>
          <SearchIcon color={focused ? 'primary' : 'inherit'} />
          <Input
            placeholder={translate('searchBar.placeholder')}
            inputProps={{ ...getInputProps() }}
          />
          {inputValue && (
            <ClearButton {...clearProps} onClick={handleClear} aria-label="clear">
              <CancelIcon />
            </ClearButton>
          )}
          <Divider orientation="vertical" />
          <EntityMenu buttonText={translate('searchBar.viewAll')} />
        </SearchBox>
        {groupedOptions.length > 0 ? (
          <ResultsBox elevation={3} {...getListboxProps()}>
            {groupedOptions.map((option, index) => (
              <ResultsItem
                key={option.name}
                to={makeEntityLink(option.code, linkType)}
                {...getOptionProps({ option, index })}
              >
                {getPlaceIcon(option.type)}
                <span>{getOptionText(option, options)}</span>
              </ResultsItem>
            ))}
            {showExpandButton && (
              <OutlinedButton
                variant="outlined"
                fullWidth
                color="primary"
                onClick={() => setExpanded(true)}
              >
                Load more results
              </OutlinedButton>
            )}
          </ResultsBox>
        ) : (
          showNoResults && (
            <NoResultsBox>
              <img src="/images/no-results-icon.svg" alt="no results" />
              <NoResultsText>No results found for the search</NoResultsText>
              <NoResultsValue>&quot;{inputValue}&quot;</NoResultsValue>
            </NoResultsBox>
          )
        )}
      </SearchContainer>
    </Fade>
  );
};

SearchBar.propTypes = {
  className: PropTypes.string,
  linkType: PropTypes.oneOf(['dashboard', 'map']),
};

SearchBar.defaultProps = {
  className: null,
  linkType: 'dashboard',
};
