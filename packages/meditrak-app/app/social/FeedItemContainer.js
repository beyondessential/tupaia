/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Markdown from 'react-native-markdown-renderer';

import { LeaderboardFeedItemContainer } from './LeaderboardFeedItemContainer';
import { formatDateAgo } from '../utilities';
import {
  DEFAULT_PADDING,
  FEED_TITLE_TEXT_STYLE,
  THEME_TEXT_COLOR_FOUR,
  getGreyShade,
  THEME_COLOR_ONE,
} from '../globalStyles';
import { loadWebsite } from '../navigation/actions';
import { TouchableOpacity } from '../widgets';

const FeedItem = props => {
  const {
    type,
    creation_date: creationDate,
    template_variables: templateVariables,
    onFeedItemPress,
  } = props;

  let content = null;

  switch (type) {
    case 'SurveyResponse':
      content = renderSurveyResponseFeedItem(templateVariables, creationDate, onFeedItemPress);
      break;

    case 'markdown':
      content = renderMarkdownFeedItem(templateVariables, onFeedItemPress);
      break;

    case 'leaderboard':
      content = renderLeaderboardFeedItem(templateVariables);
      break;

    default:
      // Return empty component for unsupported types.
      return null;
  }

  return <View style={localStyles.feedItem}>{content}</View>;
};

const getLocation = templateVariables => {
  const { facilityName, regionName, countryName } = templateVariables;
  const locationParts = [regionName || countryName];
  if (facilityName) {
    locationParts.unshift(facilityName);
  }

  return locationParts.join(', ');
};

const renderMarkdownFeedItem = (templateVariables, onFeedItemPress) => {
  const { title, image, body, link } = templateVariables;

  return (
    <TouchableOpacity
      analyticsLabel={`Feed Item: ${title}`}
      onPress={() => onFeedItemPress(link)}
      disabled={!link}
    >
      {title ? <Text style={localStyles.feedItemTitle}>{title}</Text> : null}
      {image ? (
        <Image source={{ uri: image }} style={localStyles.image} resizeMode="cover" />
      ) : null}
      {body ? <Markdown>{body}</Markdown> : null}
    </TouchableOpacity>
  );
};

const renderSurveyResponseFeedItem = (templateVariables, creationDate, onFeedItemPress) => {
  const { authorName, surveyName, countryName, photos, link } = templateVariables;
  const location = getLocation(templateVariables);

  return (
    <TouchableOpacity
      analyticsLabel={`Feed Item: Survey ${surveyName}`}
      onPress={() => onFeedItemPress(link)}
      disabled={!link}
    >
      {photos && photos.length > 0 ? (
        <Image source={{ uri: photos[0] }} style={localStyles.image} resizeMode="cover" />
      ) : null}
      <View style={localStyles.feedItemContent}>
        <Text style={[localStyles.feedText, localStyles.boldText]}>{authorName} </Text>
        <Text style={localStyles.feedText}>completed the </Text>
        <View style={localStyles.highlighted}>
          <Text style={[localStyles.feedText, localStyles.highlightedText]}>{surveyName}</Text>
        </View>
        <Text style={localStyles.feedText}>survey at {location}.</Text>
      </View>
      <View style={localStyles.feedItemFooter}>{getCountryFooter(countryName, creationDate)}</View>
    </TouchableOpacity>
  );
};

const renderLeaderboardFeedItem = templateVariables => (
  <LeaderboardFeedItemContainer
    leaderboardItems={templateVariables.leaderboard}
    title={templateVariables.title}
    hasPigs={templateVariables.hasPigs}
  />
);

const getCountryFooter = (countryName, creationDate) => (
  <View style={localStyles.feedItemFooter}>
    <Text style={localStyles.countryFooterText}>{`${countryName}, ${formatDateAgo(
      creationDate,
    )}`}</Text>
  </View>
);

const localStyles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
  },
  header: {
    fontSize: 14,
    fontWeight: '200',
    color: THEME_TEXT_COLOR_FOUR,
    paddingHorizontal: DEFAULT_PADDING,
    paddingTop: DEFAULT_PADDING,
  },
  feedItem: {
    paddingHorizontal: DEFAULT_PADDING,
    backgroundColor: THEME_COLOR_ONE,
    paddingVertical: DEFAULT_PADDING,
    marginHorizontal: DEFAULT_PADDING / 2,
    marginBottom: DEFAULT_PADDING / 2,
  },
  feedItemTitle: {
    ...FEED_TITLE_TEXT_STYLE,
  },
  feedItemContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  feedItemFooter: {
    marginTop: DEFAULT_PADDING / 2,
    alignItems: 'flex-end',
  },
  feedItemFooterText: {
    color: THEME_TEXT_COLOR_FOUR,
    fontWeight: '500',
  },
  feedText: {
    color: THEME_TEXT_COLOR_FOUR,
    fontSize: 18,
    lineHeight: 28,
  },
  boldText: {
    fontWeight: 'bold',
  },
  highlighted: {
    backgroundColor: getGreyShade(0.52),
    borderRadius: 5,
    paddingHorizontal: 8,
    marginRight: 5,
    marginVertical: 5,
  },
  highlightedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  countryFooterText: {
    color: THEME_TEXT_COLOR_FOUR,
  },
});

FeedItem.propTypes = {
  type: PropTypes.string.isRequired,
  creation_date: PropTypes.string,
  template_variables: PropTypes.object.isRequired,
  onFeedItemPress: PropTypes.func.isRequired,
};

FeedItem.defaultProps = {
  creation_date: '',
};

function mapDispatchToProps(dispatch) {
  return {
    onFeedItemPress: websiteUrl => dispatch(loadWebsite(websiteUrl)),
  };
}

export const FeedItemContainer = connect(null, mapDispatchToProps)(FeedItem);
