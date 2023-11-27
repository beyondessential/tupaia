/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { connect } from 'react-redux';

import { HomeScreen } from './HomeScreen';
import { loadSocialFeedLatest, loadSocialFeedNextPage } from '../social';

function mapStateToProps({ social }) {
  const { feedItems, errorMessage, isLoading: isFeedLoading } = social;

  return {
    feedItems,
    hasErrorMessage: !!errorMessage,
    isFeedLoading,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onLoadNextFeedPage: () => dispatch(loadSocialFeedNextPage()),
    onFetchFeedLatest: () => dispatch(loadSocialFeedLatest()),
  };
}

const HomeScreenContainer = connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

export { HomeScreenContainer };
