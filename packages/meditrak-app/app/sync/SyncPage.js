/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { TupaiaBackground, Button, Text, ProgressBar } from '../widgets';
import { formatDate } from '../utilities';
import { THEME_COLOR_ONE, THEME_FONT_SIZE_ONE } from '../globalStyles';
import { HeaderLeftButton } from '../navigation/HeaderLeftButton';

const getStatusMessage = (isSyncing, progressMessage, errorMessage) => {
  let message;

  if (errorMessage !== '') {
    message = errorMessage;
  } else if (!isSyncing) {
    message = 'Sync Complete.';
  } else {
    message = progressMessage;
  }

  return message;
};

const getSyncDateLabel = syncDate => {
  if (syncDate.getTime() > 0) {
    return formatDate(syncDate, 'H:mm, MMMM D, YYYY');
  }
  return '-';
};

const SyncPage = ({
  progress,
  total,
  progressMessage,
  errorMessage,
  onPressManualSync,
  isSyncing,
  lastSyncDate,
}) => (
  <TupaiaBackground style={localStyles.wrapper}>
    <View>
      <View style={localStyles.row}>
        <Text style={localStyles.progressDescription}>
          {getStatusMessage(isSyncing, progressMessage, errorMessage)}
        </Text>
        <ProgressBar total={total} progress={progress} isComplete={!isSyncing} />
      </View>
      <View style={localStyles.row}>
        <Text style={localStyles.lastSyncText}>Last successful sync</Text>
        <Text style={localStyles.lastSyncText}>{getSyncDateLabel(lastSyncDate)}</Text>
      </View>
      <View style={localStyles.row}>
        <Button title="Manual Sync" onPress={onPressManualSync} isDisabled={isSyncing} />
      </View>
    </View>
  </TupaiaBackground>
);

const localStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  progressDescription: {
    fontSize: THEME_FONT_SIZE_ONE,
    color: THEME_COLOR_ONE,
    textAlign: 'center',
    marginBottom: 10,
  },
  row: {
    paddingHorizontal: 50,
    paddingVertical: 20,
  },
  lastSyncText: {
    color: THEME_COLOR_ONE,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  syncIconRow: {
    flexDirection: 'row',
  },
  exchangeIcon: {
    opacity: 0.5,
  },
});

SyncPage.navigationOptions = {
  headerLeft: () => (
    <HeaderLeftButton source={require('../images/x.png')} labelVisible={false}></HeaderLeftButton>
  ),
  headerTitle: 'Sync',
};

SyncPage.propTypes = {
  progress: PropTypes.number,
  total: PropTypes.number,
  lastSyncDate: PropTypes.instanceOf(Date),
  isSyncing: PropTypes.bool,
  onPressManualSync: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
};

SyncPage.defaultProps = {
  progress: 0,
  total: 0,
  errorMessage: '',
  lastSyncDate: undefined,
  isSyncing: false,
};

export { SyncPage };
