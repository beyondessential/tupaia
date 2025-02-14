import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import MuiButton from '@material-ui/core/Button';
import MuiPaper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import MuiDivider from '@material-ui/core/Divider';
import MuiIconButton from '@material-ui/core/IconButton';
import MuiSearchIcon from '@material-ui/icons/Search';
import CancelIcon from '@material-ui/icons/Cancel';
import Fade from '@material-ui/core/Fade';
import { EntityMenu } from './EntityMenu';
import { NoResultsMessage } from './NoResultsMessage';
import { useProjectEntitiesData } from '../api';
import { useAutocomplete, getPlaceIcon, getOptionText, makeEntityLink, useI18n } from '../utils';

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

const DEFAULT_LIMIT = 5;
const EXPANDED_LIMIT = 200;

export const SearchBar = ({ linkType, className }) => {
  const navigate = useNavigate();
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
    id: 'location-search',
    inputValue,
    setInputValue,
    options,
    limit: inputValue && expanded ? EXPANDED_LIMIT : DEFAULT_LIMIT,
    onChange: (event, option) => {
      if (option && option.code) {
        navigate(makeEntityLink(option.code, linkType));
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
            placeholder={translate('home.searchLocation')}
            inputProps={{ ...getInputProps() }}
          />
          {inputValue && (
            <ClearButton {...clearProps} onClick={handleClear} aria-label="clear">
              <CancelIcon />
            </ClearButton>
          )}
          <Divider orientation="vertical" />
          <EntityMenu buttonText={translate('home.orViewAll')} />
        </SearchBox>
        {groupedOptions.length > 0 ? (
          <ResultsBox {...getListboxProps()}>
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
            <ResultsBox {...getListboxProps()}>
              <NoResultsMessage inputValue={inputValue} />
            </ResultsBox>
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
