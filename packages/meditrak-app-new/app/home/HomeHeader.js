/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';

import {
  THEME_COLOR_ONE,
  THEME_SECTION_BORDER_COLOR,
  THEME_TEXT_COLOR_FOUR,
  DEFAULT_PADDING,
  THEME_COLOR_DARK,
  getGreyShade,
  getThemeColorOneFaded,
} from '../globalStyles';
import { formatPlural } from '../utilities';
import {
  Pig,
  Coconut,
  Icon,
  StatusMessage,
  STATUS_MESSAGE_ERROR,
  TouchableOpacity,
} from '../widgets';
import { HomeToolbarContainer } from './HomeToolbarContainer';

export class HomeHeader extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isCoconutsInfoVisible: false,
      isPigsInfoVisible: false,
    };
  }

  async componentDidMount() {
    const { onFetchFeedLatest, onGetRewards } = this.props;
    onFetchFeedLatest();
    onGetRewards();
  }

  renderBio() {
    const { name } = this.props;

    return (
      <View style={localStyles.sectionBio}>
        <View style={localStyles.sectionBioContent}>
          <Text style={localStyles.nameText}>{name}</Text>
        </View>
      </View>
    );
  }

  renderRewardSection() {
    const { coconuts, pigs } = this.props;
    const { isCoconutsInfoVisible, isPigsInfoVisible } = this.state;
    const rewardIconSize = 60;

    return (
      <View style={[localStyles.section, localStyles.rewardSection]}>
        <TouchableOpacity
          analyticsLabel="Home Header: Coconut"
          style={[localStyles.rewardSectionItem, localStyles.rewardSectionItemFirst]}
          onPress={() => this.setState({ isCoconutsInfoVisible: !isCoconutsInfoVisible })}
        >
          <Coconut size={rewardIconSize} />
          <Text style={localStyles.rewardSectionHeader}>
            {formatPlural('1 COCONUT', '@count COCONUTS', coconuts)}
          </Text>
          {isCoconutsInfoVisible ? (
            <View style={localStyles.rewardSectionHelp}>
              <Text style={localStyles.rewardSectionHelpText}>
                Earn coconuts by completing surveys on Tupaia.
              </Text>
              <Icon
                name="check"
                color={THEME_COLOR_DARK}
                size={12}
                style={localStyles.rewardSectionHelpCheck}
              />
            </View>
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          analyticsLabel="Home Header: Pig"
          style={localStyles.rewardSectionItem}
          onPress={() => this.setState({ isPigsInfoVisible: !isPigsInfoVisible })}
        >
          <Pig size={rewardIconSize} />
          <Text style={localStyles.rewardSectionHeader}>
            {formatPlural('1 PIG', '@count PIGS', pigs)}
          </Text>
          {isPigsInfoVisible ? (
            <View style={localStyles.rewardSectionHelp}>
              <Text style={localStyles.rewardSectionHelpText}>
                Earn 1 pig for every 100 coconuts and on special milestones.
              </Text>
              <Icon
                name="check"
                color={THEME_COLOR_DARK}
                size={12}
                style={localStyles.rewardSectionHelpCheck}
              />
            </View>
          ) : null}
        </TouchableOpacity>
      </View>
    );
  }

  renderSurveySection() {
    return (
      <View style={[localStyles.section, localStyles.surveySection]}>
        <Text style={localStyles.surveySectionText}>
          Tupaia gathers data to map health systems around the world. Use Tupaia MediTrak to
          complete health facility surveys (and collect coconuts!) and share news, stories and
          information with the Tupaia community.
        </Text>
        <HomeToolbarContainer style={localStyles.surveyButton} />
      </View>
    );
  }

  renderFeedHeader() {
    const { onFetchFeedLatest, isFeedLoading, feedErrorMessage } = this.props;

    return (
      <View style={localStyles.feedSectionHeader}>
        <View style={localStyles.sectionHeaderTop}>
          <Text style={localStyles.sectionHeaderTitle}>RECENT ACTIVITY</Text>
          {isFeedLoading ? (
            <ActivityIndicator />
          ) : (
            <TouchableOpacity analyticsLabel="Home Header: Reload feed" onPress={onFetchFeedLatest}>
              <Icon name="refresh" size={20} color={THEME_TEXT_COLOR_FOUR} />
            </TouchableOpacity>
          )}
        </View>
        {feedErrorMessage ? (
          <StatusMessage
            message={feedErrorMessage}
            type={STATUS_MESSAGE_ERROR}
            style={localStyles.sectionHeaderBottom}
          />
        ) : null}
      </View>
    );
  }

  render() {
    const { onLayout } = this.props;

    return (
      <View onLayout={onLayout}>
        {this.renderBio()}
        {this.renderRewardSection()}
        {this.renderSurveySection()}
        {this.renderFeedHeader()}
      </View>
    );
  }
}

HomeHeader.propTypes = {
  name: PropTypes.string.isRequired,
  coconuts: PropTypes.number.isRequired,
  pigs: PropTypes.number.isRequired,
  onFetchFeedLatest: PropTypes.func.isRequired,
  isFeedLoading: PropTypes.bool.isRequired,
  feedErrorMessage: PropTypes.string.isRequired,
  onGetRewards: PropTypes.func.isRequired,
  onLayout: PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
  section: {
    backgroundColor: THEME_COLOR_ONE,
    padding: DEFAULT_PADDING,
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: THEME_SECTION_BORDER_COLOR,
    marginBottom: DEFAULT_PADDING / 2,
    paddingBottom: DEFAULT_PADDING / 2,
    width: '100%',
  },
  sectionHeaderText: {
    fontSize: 20,
    fontWeight: '500',
  },
  sectionBio: {
    backgroundColor: THEME_COLOR_ONE,
    flexDirection: 'row',
    padding: DEFAULT_PADDING,
    paddingTop: 0,
  },
  nameText: {
    color: THEME_COLOR_DARK,
    fontSize: 34,
  },
  rewardSection: {
    backgroundColor: THEME_COLOR_ONE,
    paddingHorizontal: DEFAULT_PADDING,
    padding: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: THEME_SECTION_BORDER_COLOR,
  },
  rewardSectionItem: {
    position: 'relative',
    width: '50%',
    padding: DEFAULT_PADDING,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderColor: THEME_SECTION_BORDER_COLOR,
  },
  rewardSectionItemFirst: {
    borderLeftWidth: 0,
    borderRightWidth: 1,
    marginRight: -1,
  },
  rewardSectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  rewardSectionHelp: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getThemeColorOneFaded(0.9),
    padding: DEFAULT_PADDING,
    justifyContent: 'center',
  },
  rewardSectionHelpText: {
    fontSize: 14,
  },
  rewardSectionHelpCheck: {
    marginTop: DEFAULT_PADDING / 2,
    alignSelf: 'flex-end',
  },
  surveySection: {
    alignItems: 'center',
    paddingBottom: DEFAULT_PADDING,
    borderBottomWidth: 1,
    borderBottomColor: getGreyShade(0.13),
  },
  surveySectionText: {
    lineHeight: 20,
    fontSize: 14,
    textAlign: 'left',
  },
  surveyButton: {
    marginTop: DEFAULT_PADDING,
  },
  feedSectionHeader: {
    borderRadius: 3,
    marginHorizontal: DEFAULT_PADDING,
    paddingHorizontal: 0,
    paddingVertical: DEFAULT_PADDING,
  },
  sectionHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderBottom: {
    marginTop: DEFAULT_PADDING,
    marginBottom: 0,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    color: THEME_TEXT_COLOR_FOUR,
    flexGrow: 1,
    fontWeight: 'bold',
  },
});
