/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { isNull } from 'lodash';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import CircularProgress from 'material-ui/CircularProgress';
import { List, ListItem } from 'material-ui/List';
import {
  selectOrgUnitChildren,
  selectCurrentProjectCode,
  selectCodeFromOrgUnit,
} from '../../selectors';
import { ControlBar } from '../../components/ControlBar';
import {
  changeSearch,
  fetchMoreSearchResults,
  toggleSearchExpand,
  setOrgUnit,
  openMapPopup,
  requestOrgUnit,
} from '../../actions';
import { SearchBarItem } from '../../components/SearchBarItem';

const styles = {
  menuOption: {
    width: 320,
    padding: 7,
  },
  contentWrapper: {
    maxHeight: 'calc(100vh - 100px)',
    overflowY: 'auto',
  },
  searchResultList: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    overflowY: 'auto',
    maxHeight: '350px',
  },
  searchResultItem: {
    display: 'flex',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    minHeight: 30,
    padding: '5px',
    lineHeight: '150%',
    alignItems: 'center',
  },
  searchResponseText: {
    paddingTop: 14,
    overflowY: 'auto',
    minHeight: 20,
  },
  hierarchyItem: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  loadingContainer: {
    marginTop: '10px',
    height: '100px',
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingResultText: {
    marginTop: '20px',
  },
};

const LoadMoreResultsButton = styled(Button)`
  width: 100%;
  margin: 15px 0 5px 0;
  padding: 10px 0;
  border-radius: 3px;
  background: rgb(68, 70, 80);

  &:hover {
    background: rgb(43, 45, 56);
  }
`;

export class SearchBar extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isSafeToCloseResults: true,
    };
  }

  componentWillMount() {
    const { hierarchyData, requestRootOrgUnit } = this.props;
    if (!hierarchyData || !Array.isArray(hierarchyData) || hierarchyData.length < 2) {
      requestRootOrgUnit();
    }
  }

  renderSearchResults() {
    const {
      isLoadingSearchResults,
      searchResults,
      hasMoreResults,
      onOrgUnitClick,
      searchString,
      onLoadMoreSearchResults,
    } = this.props;
    if (searchString === '') {
      return null;
    }

    // Show loading results indicator
    if (isLoadingSearchResults) {
      return (
        <div style={styles.loadingContainer}>
          <CircularProgress />
          <div style={styles.loadingResultText}>Loading results...</div>
        </div>
      );
    }

    // Show 'No results found'
    if (!searchResults || !Array.isArray(searchResults) || searchResults.length < 1) {
      return (
        <div
          style={styles.searchResponseText}
        >{`No results found for search '${searchString}'.`}</div>
      );
    }

    // Show actual results
    return (
      <div>
        <List style={styles.searchResultList}>
          {searchResults.map(({ displayName, organisationUnitCode }) => (
            <ListItem
              style={{ display: 'flex' }}
              innerDivStyle={styles.searchResultItem}
              primaryText={displayName}
              onClick={() => onOrgUnitClick(organisationUnitCode)}
              key={displayName}
            />
          ))}
        </List>
        {hasMoreResults ? (
          <LoadMoreResultsButton onClick={onLoadMoreSearchResults}>
            LOAD MORE RESULTS
          </LoadMoreResultsButton>
        ) : null}
      </div>
    );
  }

  renderHierarchy() {
    const { hierarchyData, orgUnitFetchError } = this.props;

    if (isNull(hierarchyData))
      return <div style={styles.searchResponseText}>Loading countries...</div>;
    if (orgUnitFetchError) return <h2>Server error, try refresh</h2>;
    if (hierarchyData.length < 1) return null;

    const hierarchy = hierarchyData.map((item, index) => (
      <SearchBarItem
        key={item}
        organisationUnitCode={item}
        isFinalRow={index === hierarchyData.length - 1}
      />
    ));
    return <List style={styles.hierarchyItem}>{hierarchy}</List>;
  }

  render() {
    const { isExpanded, onSearchChange, onSearchBlur, onExpandClick } = this.props;
    const { isSafeToCloseResults } = this.state;
    const SearchResultsComponent = isExpanded && this.renderSearchResults();
    return (
      <div style={styles.menuOption}>
        <ControlBar
          onSearchChange={onSearchChange}
          onControlBlur={() => onSearchBlur(isExpanded, isSafeToCloseResults)}
          isExpanded={isExpanded}
          onExpandClick={() => onExpandClick()}
          hintText="Search Location"
        >
          <div
            onMouseLeave={() => this.setState({ isSafeToCloseResults: true })}
            onMouseEnter={() => this.setState({ isSafeToCloseResults: false })}
            style={styles.contentWrapper}
          >
            {SearchResultsComponent || this.renderHierarchy()}
          </div>
        </ControlBar>
      </div>
    );
  }
}

SearchBar.propTypes = {
  onExpandClick: PropTypes.func.isRequired,
  onOrgUnitClick: PropTypes.func.isRequired,
  requestRootOrgUnit: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool,
  isLoadingSearchResults: PropTypes.bool,
  hasMoreResults: PropTypes.bool,
  searchResults: PropTypes.arrayOf(PropTypes.object),
  hierarchyData: PropTypes.arrayOf(PropTypes.string),
  searchString: PropTypes.string,
  orgUnitFetchError: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  onLoadMoreSearchResults: PropTypes.func,
  onSearchBlur: PropTypes.func,
};

SearchBar.defaultProps = {
  isExpanded: false,
  isLoadingSearchResults: false,
  searchResults: null,
  hasMoreResults: false,
  hierarchyData: null,
  searchString: '',
  orgUnitFetchError: '',
  onLoadMoreSearchResults: undefined,
  onSearchBlur: undefined,
};

const mapStateToProps = state => {
  const {
    isExpanded,
    isLoadingSearchResults,
    searchResults,
    hasMoreResults,
    searchString,
  } = state.searchBar;
  const { orgUnitFetchError } = state.orgUnits;
  const hierarchyData = selectCodeFromOrgUnit(
    selectOrgUnitChildren(state, selectCurrentProjectCode(state)),
  );
  return {
    isExpanded,
    isLoadingSearchResults,
    searchResults,
    hasMoreResults,
    searchString,
    hierarchyData,
    orgUnitFetchError,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSearchChange: event => dispatch(changeSearch(event.target.value)),
    onLoadMoreSearchResults: () => dispatch(fetchMoreSearchResults(true)),
    onExpandClick: () => dispatch(toggleSearchExpand()),
    onSearchBlur: (isExpanded, isSafeToCloseResults) =>
      isExpanded && isSafeToCloseResults && dispatch(toggleSearchExpand()),
    onOrgUnitClick: organisationUnitCode => {
      dispatch(setOrgUnit(organisationUnitCode));
      dispatch(openMapPopup(organisationUnitCode));
    },
    requestRootOrgUnit: () => dispatch(requestOrgUnit()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchBar);
