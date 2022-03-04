/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from 'material-ui/CircularProgress';
import { connect } from 'react-redux';

import List from '../../../components/mobile/List';
import Overlay from '../../../components/mobile/Overlay';
import EntityHierarchy from '../EntityHierarchy';
import { changeSearch, setOrgUnit } from '../../../actions';
import { DARK_BLUE, WHITE } from '../../../styles';

const SearchOverlay = ({
  isLoading,
  searchString,
  searchResponse,
  onClose,
  onChangeSearch,
  onChangeOrgUnit,
}) => (
  <Overlay titleElement={renderTitleElement(searchString, isLoading, onChangeSearch)}>
    {searchString === '' ? (
      <EntityHierarchy onClick={onClose} />
    ) : (
      <List
        title={getSearchResponseMessage(searchString, searchResponse, isLoading)}
        items={searchResponse.map(({ displayName, organisationUnitCode }) => ({
          title: displayName,
          key: organisationUnitCode,
          data: organisationUnitCode,
        }))}
        onSelectItem={organisationUnitCode => {
          onChangeOrgUnit(organisationUnitCode);
          onClose();
        }}
      />
    )}
  </Overlay>
);

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
  <div style={styles.searchOverlayTitle}>
    <input
      type="text"
      autoCorrect="off"
      spellCheck="false"
      autoComplete="off"
      placeholder="Location name..."
      autoFocus // eslint-disable-line jsx-a11y/no-autofocus
      style={styles.searchInput}
      value={searchString}
      onChange={event => onChangeSearch(event.target.value)}
    />
    {isLoading && <CircularProgress style={styles.searchInputLoader} color={WHITE} size={25} />}
  </div>
);

const styles = {
  searchInput: {
    display: 'block',
    outline: 0,
    border: 0,
    backgroundColor: DARK_BLUE,
    color: WHITE,
    padding: 12,
    flexGrow: 1,
    boxSizing: 'border-box',
    borderRadius: 2,
  },
  searchInputLoader: {
    position: 'absolute',
    top: 14,
    right: 45,
  },
  searchOverlayTitle: {
    flexGrow: 1,
    justifyContent: 'center',
    display: 'flex',
  },
};

SearchOverlay.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  searchString: PropTypes.string.isRequired,
  searchResponse: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
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
  onChangeSearch: searchString => dispatch(changeSearch(searchString)),
  dispatch,
});

const mergeProps = (stateProps, { dispatch, ...dispatchProps }, { onClose, ...ownProps }) => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
  onChangeOrgUnit: organisationUnitCode => {
    dispatch(setOrgUnit(organisationUnitCode));
  },
  onClose: () => {
    dispatch(changeSearch(''));
    onClose();
  },
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(SearchOverlay);
