import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Coconut, Pig } from '../widgets';
import {
  BORDER_RADIUS,
  THEME_COLOR_TWO,
  THEME_COLOR_ONE,
  FEED_TITLE_TEXT_STYLE,
  getGreyShade,
} from '../globalStyles';

const COLUMNS = {
  RANKING: 'RANKING',
  NAME: 'NAME',
  COCONUTS: 'COCONUTS',
  PIGS: 'PIGS',
};

const getHeaderForColumn = columnName => {
  switch (columnName) {
    case COLUMNS.RANKING:
      return <Text style={localStyles.leaderboardHeaderText}>#</Text>;

    case COLUMNS.NAME:
      return <Text style={localStyles.leaderboardHeaderText}>Name</Text>;

    case COLUMNS.COCONUTS:
      return <Coconut size={20} color={THEME_COLOR_ONE} />;

    case COLUMNS.PIGS:
      return <Pig size={20} color={THEME_COLOR_ONE} />;

    default:
      return null;
  }
};

const getColumnContent = (columnName, ranking, { name = '', coconuts = '', pigs = '' }) => {
  switch (columnName) {
    case COLUMNS.RANKING:
      return (
        <Text style={[localStyles.leaderboardCellRanking, localStyles.leaderboardCellText]}>
          {ranking}
        </Text>
      );

    case COLUMNS.NAME:
      return (
        <Text style={[localStyles.leaderboardCellName, localStyles.leaderboardCellText]}>
          {name}
        </Text>
      );

    case COLUMNS.COCONUTS:
      return (
        <Text
          style={[
            localStyles.leaderboardCellCount,
            localStyles.leaderboardCellCountText,
            localStyles.leaderboardCellText,
          ]}
        >
          {coconuts}
        </Text>
      );

    case COLUMNS.PIGS:
      return (
        <Text
          style={[
            localStyles.leaderboardCellCount,
            localStyles.leaderboardCellCountText,
            localStyles.leaderboardCellText,
          ]}
        >
          {pigs}
        </Text>
      );

    default:
      return null;
  }
};

const LeaderboardFeedItem = props => {
  const {
    leaderboardItems,
    title,
    currentUserCoconuts,
    currentUserPigs,
    currentUserName,
    currentUserId,
    hasPigs,
  } = props;

  const doesUserAppearInLeaderboard = !!leaderboardItems.find(
    leaderBoardItem => leaderBoardItem.user_id === currentUserId,
  );
  const columns = [COLUMNS.RANKING, COLUMNS.NAME, COLUMNS.COCONUTS];
  if (hasPigs) {
    columns.push(COLUMNS.PIGS);
  }

  return (
    <View style={localStyles.container}>
      <Text style={localStyles.title}>{title}</Text>
      <View style={localStyles.leaderboard}>
        {columns.map(columnName => (
          <View style={localStyles[`leaderboardColumn_${columnName}`]} key={`column_${columnName}`}>
            <View style={[localStyles.leaderboardCell, localStyles.leaderboardHeader]}>
              {getHeaderForColumn(columnName)}
            </View>
            {leaderboardItems.map(
              (
                { pigs, coconuts, first_name: firstName, last_name: lastName, user_id: userId },
                index,
              ) => (
                <View
                  style={[
                    localStyles.leaderboardCell,
                    userId === currentUserId ? localStyles.leaderboardCellCurrentUser : null,
                  ]}
                  key={`${columnName}_${userId}`}
                >
                  {getColumnContent(columnName, index + 1, {
                    name: `${firstName} ${lastName}`,
                    pigs,
                    coconuts,
                  })}
                </View>
              ),
            )}
            {!doesUserAppearInLeaderboard ? (
              <View
                style={[localStyles.leaderboardCell, localStyles.leaderboardCellCurrentUser]}
                key={`${columnName}_${currentUserId}`}
              >
                {getColumnContent(columnName, '-', {
                  name: currentUserName,
                  coconuts: currentUserCoconuts,
                  pigs: currentUserPigs,
                })}
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
};

LeaderboardFeedItem.propTypes = {
  leaderboardItems: PropTypes.arrayOf(
    PropTypes.shape({
      user_id: PropTypes.string,
      first_name: PropTypes.string,
      last_name: PropTypes.string,
      coconuts: PropTypes.string,
      pigs: PropTypes.string,
    }),
  ).isRequired,
  title: PropTypes.string.isRequired,
  currentUserCoconuts: PropTypes.number.isRequired,
  currentUserPigs: PropTypes.number.isRequired,
  currentUserId: PropTypes.string.isRequired,
  currentUserName: PropTypes.string.isRequired,
  hasPigs: PropTypes.bool.isRequired,
};

const leaderboardFontSize = 16;
const localStyles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
  },
  title: {
    ...FEED_TITLE_TEXT_STYLE,
    textAlign: 'center',
  },
  leaderboard: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS,
    borderColor: getGreyShade(0.1),
    backgroundColor: getGreyShade(0.05),
    flexDirection: 'row',
  },
  leaderboardCell: {
    padding: 10,
  },
  leaderboardHeader: {
    backgroundColor: THEME_COLOR_TWO,
    height: 40,
  },
  leaderboardHeaderText: {
    color: THEME_COLOR_ONE,
    fontWeight: 'bold',
    fontSize: leaderboardFontSize,
  },
  leaderboardCellText: {
    fontSize: leaderboardFontSize,
  },
  leaderboardCellRanking: {
    fontWeight: 'bold',
  },
  leaderboardCellCount: {
    flexBasis: 50,
  },
  leaderboardCellCountText: {
    textAlign: 'right',
    fontWeight: 'bold',
  },
  leaderboardCellCurrentUser: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: getGreyShade(0.1),
    backgroundColor: getGreyShade(0.01),
  },
  [`leaderboardColumn_${COLUMNS.NAME}`]: {
    flexGrow: 1,
  },
});

const mapStateToProps = ({ rewards, authentication }) => ({
  currentUserCoconuts: rewards.coconuts,
  currentUserPigs: rewards.pigs,
  currentUserName: authentication.name,
  currentUserId: authentication.currentUserId,
});

export const LeaderboardFeedItemContainer = connect(mapStateToProps)(LeaderboardFeedItem);
