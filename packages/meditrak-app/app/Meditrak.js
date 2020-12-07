/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { BackHandler } from 'react-native';
import { database } from './database';
import { MessageOverlay } from './messages/MessageOverlay';
import { isBeta, betaBranch } from './version';
import { NavigationMenuContainer, goBack } from './navigation';
import { DEFAULT_PADDING, THEME_COLOR_THREE, THEME_COLOR_ONE } from './globalStyles';

import { requestLocationPermission } from './utilities/userLocation/permission';

class MeditrakContainer extends React.Component {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    database.enableSync(this.props.dispatch);

    requestLocationPermission();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  getCanNavigateBack = () => {
    const { nav } = this.props;
    return nav.index !== 0;
  };

  onBackPress = () => {
    if (!this.getCanNavigateBack()) return false;

    const { onGoBack } = this.props;
    onGoBack();
    return true;
  };

  renderBetaBanner() {
    return (
      <View style={localStyles.betaBanner} pointerEvents="none">
        <Text style={localStyles.betaBannerText}>{betaBranch.toUpperCase()}</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={localStyles.container}>
        <NavigationMenuContainer>{this.props.children}</NavigationMenuContainer>
        <MessageOverlay />
        {isBeta ? this.renderBetaBanner() : null}
      </View>
    );
  }
}

MeditrakContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  betaBanner: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    opacity: 0.8,
    backgroundColor: THEME_COLOR_THREE,
    padding: DEFAULT_PADDING / 4,
  },
  betaBannerText: {
    color: THEME_COLOR_ONE,
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
});

const mapStateToProps = state => ({
  nav: state.nav,
});

const mapDispatchToProps = dispatch => ({
  dispatch,
  onGoBack: () => dispatch(goBack()),
});

export const Meditrak = connect(mapStateToProps, mapDispatchToProps)(MeditrakContainer);
