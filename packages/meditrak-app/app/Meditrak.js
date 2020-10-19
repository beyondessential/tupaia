/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { addNavigationHelpers } from 'react-navigation';

import { MessageOverlay } from './messages/MessageOverlay';
import { isBeta, betaBranch } from './version';
import { NavigationMenuContainer, Navigator, goBack, NAVIGATION_ADD_LISTENER } from './navigation';
import { TupaiaBackground } from './widgets';
import { DEFAULT_PADDING, THEME_COLOR_THREE, THEME_COLOR_ONE } from './globalStyles';

import { requestLocationPermission } from './utilities/userLocation/permission';

class MeditrakContainer extends React.Component {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackEvent);
    this.props.database.enableSync(this.props.dispatch);

    requestLocationPermission();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackEvent);
  }

  getCanNavigateBack = () => {
    const { navigationState } = this.props;
    return navigationState.index !== 0;
  };

  handleBackEvent = () => {
    // If we are on base screen (e.g. home), back button should close app as we can't go back
    if (!this.getCanNavigateBack()) return false;
    this.props.onBack();
    return true;
  };

  renderBetaBanner() {
    return (
      <View style={localStyles.betaBanner} pointerEvents={'none'}>
        <Text style={localStyles.betaBannerText}>{betaBranch.toUpperCase()}</Text>
      </View>
    );
  }

  render() {
    const { dispatch, navigationState } = this.props;
    return (
      <View style={localStyles.container}>
        <NavigationMenuContainer>
          <Navigator
            ref={navigator => {
              this.navigator = navigator;
            }}
            navigation={addNavigationHelpers({
              dispatch,
              state: navigationState,
              addListener: NAVIGATION_ADD_LISTENER,
            })}
            screenProps={{ database: this.props.database, BackgroundComponent: TupaiaBackground }}
          />
        </NavigationMenuContainer>
        <MessageOverlay />
        {isBeta ? this.renderBetaBanner() : null}
      </View>
    );
  }
}

MeditrakContainer.propTypes = {
  database: PropTypes.any.isRequired,
  dispatch: PropTypes.func.isRequired,
  navigationState: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
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

function mapStateToProps(state) {
  return {
    navigationState: state.navigation,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    onBack: () => dispatch(goBack()),
  };
}

export const Meditrak = connect(mapStateToProps, mapDispatchToProps)(MeditrakContainer);
