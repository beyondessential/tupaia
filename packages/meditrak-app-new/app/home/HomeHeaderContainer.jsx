/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { connect } from 'react-redux';

import { HomeHeader } from './HomeHeader';
import { loadSocialFeedLatest, loadSocialFeedNextPage } from '../social';
import { getLatestUserRewardCount } from '../rewards';

function mapStateToProps({ authentication, social, rewards }) {
  const { name } = authentication;
  const { isLoading: isFeedLoading, errorMessage: feedErrorMessage } = social;
  const { coconuts, pigs } = rewards;

  return {
    name,
    coconuts,
    pigs,
    isFeedLoading,
    feedErrorMessage,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onLoadNextFeedPage: () => dispatch(loadSocialFeedNextPage()),
    onFetchFeedLatest: () => dispatch(loadSocialFeedLatest()),
    onGetRewards: () => dispatch(getLatestUserRewardCount()),
  };
}

const HomeHeaderContainer = connect(mapStateToProps, mapDispatchToProps)(HomeHeader);

export { HomeHeaderContainer };
