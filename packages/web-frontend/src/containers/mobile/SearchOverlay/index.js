/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import CircularProgress from 'material-ui/CircularProgress';
import List from '../../../components/mobile/List';
import Overlay from '../../../components/mobile/Overlay';
import {
  changeSearch,
  toggleSearchExpand,
  setOrgUnit,
  setOverlayComponent,
} from '../../../actions';
import { DARK_BLUE, WHITE } from '../../../styles';
import { EntityNav } from '../EntityNav';

const SearchInput = styled.input`
  display: block;
  outline: 0;
  border: 0;
  background-color: ${DARK_BLUE};
  color: ${WHITE};
  padding: 12px;
  flex-grow: 1;
  box-sizing: border-box;
  border-radius: 2px;
`;

const SearchLoader = styled(CircularProgress)`
  position: absolute;
  top: 14px;
  right: 45px;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-grow: 1;
`;

const getSearchResponseMessage = (searchString, searchResponse, searchIsLoading) => {
  const resultCount = searchResponse.length;

  if (searchString.length > 0 && resultCount > 0) {
    return `${resultCount} ${resultCount === 1 ? 'result' : 'results'} found...`;
  }

  if (searchString.length > 0 && !searchIsLoading) {
    return 'No results found.';
  }

  if (searchIsLoading) {
    return 'Searching...';
  }

  return '';
};

const renderTitleElement = (searchString, isLoading, onChangeSearch) => (
  <Container>
    <SearchInput
      type="text"
      autoCorrect="off"
      spellCheck="false"
      autoComplete="off"
      placeholder="Location name..."
      autoFocus // eslint-disable-line jsx-a11y/no-autofocus
      value={searchString}
      onChange={event => onChangeSearch(event.target.value)}
    />
    {isLoading && <SearchLoader color={WHITE} size={25} />}
  </Container>
);

const SearchOverlay = ({
  isLoading,
  searchString,
  searchResponse,
  onToggleSearchExpand,
  onChangeSearch,
  onChangeOrgUnit,
}) => {
  return (
    <Overlay
      titleElement={renderTitleElement(searchString, isLoading, onChangeSearch)}
      onClose={onToggleSearchExpand}
    >
      {!searchString && <EntityNav />}
      <List
        title={getSearchResponseMessage(searchString, searchResponse, isLoading)}
        items={searchResponse.map(({ displayName, organisationUnitCode }) => ({
          title: displayName,
          key: organisationUnitCode,
          data: organisationUnitCode,
        }))}
        onSelectItem={organisationUnitCode => {
          onToggleSearchExpand();
          onChangeOrgUnit(organisationUnitCode);
        }}
      />
    </Overlay>
  );
};

SearchOverlay.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  searchString: PropTypes.string.isRequired,
  searchResponse: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onToggleSearchExpand: PropTypes.func.isRequired,
  onChangeSearch: PropTypes.func.isRequired,
  onChangeOrgUnit: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { isLoadingSearchResults, searchString, searchResults } = state.searchBar;
  const { isOverlayOpen } = state.global;

  return {
    isLoading: isLoadingSearchResults,
    searchString,
    searchResponse: searchResults || [],
    isOverlayOpen,
  };
};

const mapDispatchToProps = dispatch => ({
  onToggleSearchExpand: () => dispatch(toggleSearchExpand()),
  onChangeSearch: searchString => dispatch(changeSearch(searchString)),
  dispatch,
});

const mergeProps = (
  { isOverlayOpen, ...stateProps },
  { dispatch, ...dispatchProps },
  ownProps,
) => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
  onChangeOrgUnit: organisationUnitCode => {
    dispatch(setOrgUnit(organisationUnitCode));

    // Close any pages that are open.
    if (isOverlayOpen) {
      dispatch(setOverlayComponent(null));
    }
  },
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(SearchOverlay);
