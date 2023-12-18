/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Platform, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import { AnimatedView, Icon, TouchableOpacity } from '../widgets';
import { THEME_COLOR_THREE, HEADER_HEIGHT } from '../globalStyles';
import { viewSyncPage, toggleSideMenu } from './actions';
import { getIsSyncing } from '../sync';

const DumbHeaderToolbar = ({ onShowMenu, onPressSyncStatus, isSyncing }) => (
  <View style={localStyles.container}>
    <TouchableOpacity
      analyticsLabel="Header Toolbar: Sync"
      onPress={onPressSyncStatus}
      style={localStyles.rightButton}
    >
      <AnimatedView style={localStyles.rightButtonIcon} shouldAnimate={isSyncing}>
        <Icon name="refresh" style={[localStyles.icon]} />
      </AnimatedView>
    </TouchableOpacity>
    <TouchableOpacity
      analyticsLabel="Header Toolbar: Menu"
      onPress={onShowMenu}
      style={localStyles.rightButton}
    >
      <Icon name="bars" style={[localStyles.icon, localStyles.rightButtonIcon]} />
    </TouchableOpacity>
  </View>
);

const buttonStyle = {
  height: HEADER_HEIGHT,
  flexDirection: 'row',
  alignItems: 'center',
};

const headerIconSize = 21; // Odd number required for animation centrepoint.
const extraIconPadding = 3;
const headerHorizontalPadding = Platform.OS === 'ios' ? 6 : 12;

const localStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: headerHorizontalPadding,
  },
  icon: {
    color: THEME_COLOR_THREE,
    fontSize: headerIconSize,
  },
  rightButton: {
    ...buttonStyle,
  },
  rightButtonIcon: {
    marginLeft: 12,
    width: headerIconSize + extraIconPadding, // Padding prevents icon cropping on Android when spinning
    overflow: 'visible',
    alignItems: 'center',
  },
});

DumbHeaderToolbar.propTypes = {
  onShowMenu: PropTypes.func.isRequired,
  onPressSyncStatus: PropTypes.func.isRequired,
  isSyncing: PropTypes.bool,
};

DumbHeaderToolbar.defaultProps = {
  isSyncing: false,
};

function mapStateToProps(state) {
  return {
    navigationState: state.nav,
    isSyncing: getIsSyncing(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onPressSyncStatus: () => dispatch(viewSyncPage()),
    onShowMenu: () => dispatch(toggleSideMenu(true)),
  };
}

const HeaderToolbar = connect(mapStateToProps, mapDispatchToProps)(DumbHeaderToolbar);

export { HeaderToolbar };
