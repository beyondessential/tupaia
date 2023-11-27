/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { ProgressBar, TupaiaLogo, Text, TouchableOpacity, TupaiaBackground } from '../widgets';
import { DEFAULT_PADDING, THEME_COLOR_ONE } from '../globalStyles';

export const WelcomePage = ({ syncMessage, total, progress, isSyncing, onCancel }) => {
  return (
    <TupaiaBackground style={localStyles.container}>
      <StatusBar barStyle="light-content" />
      <TupaiaLogo white width={150} height={50} style={localStyles.logo} />
      <ProgressBar
        total={total}
        progress={progress}
        isComplete={!isSyncing}
        style={localStyles.progressBar}
      />
      <Text style={localStyles.syncMessageText}>{syncMessage}</Text>
      <TouchableOpacity onPress={onCancel} analyticsLabel="Welcome: Cancel">
        <Text style={localStyles.cancelLink}>Cancel and logout</Text>
      </TouchableOpacity>
    </TupaiaBackground>
  );
};

WelcomePage.propTypes = {
  syncMessage: PropTypes.string,
  total: PropTypes.number,
  progress: PropTypes.number,
  isSyncing: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
};

WelcomePage.defaultProps = {
  syncMessage: 'Logging in',
  progress: 0,
  total: 0,
  isSyncing: false,
};

const localStyles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncMessageText: {
    color: THEME_COLOR_ONE,
    marginTop: DEFAULT_PADDING,
  },
  progressBar: {
    width: '70%',
  },
  logo: {
    marginBottom: DEFAULT_PADDING,
  },
  cancelLink: {
    color: THEME_COLOR_ONE,
    textDecorationLine: 'underline',
    marginTop: 30,
    fontSize: 12,
  },
});
