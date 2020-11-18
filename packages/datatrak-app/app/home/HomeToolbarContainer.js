import React from 'react';
import PropTypes from 'prop-types';
import { Dimensions, StyleSheet, View, ViewPropTypes } from 'react-native';
import { connect } from 'react-redux';

import { navigateToSurveysMenu, navigateToTupaiaWebsite } from '../navigation';
import { DEFAULT_PADDING, THEME_COLOR_TWO, SMALL_PHONE_WIDTH } from '../globalStyles';
import { BlueButton, Button } from '../widgets';

const HomeToolbar = ({ onNavigateToSurveysMenu, onNavigateToTupaiaWebsite, style }) => (
  <View style={[localStyles.toolbar, style]}>
    <Button
      title="EXPLORE DATA"
      onPress={onNavigateToTupaiaWebsite}
      style={[localStyles.button, localStyles.exploreButton]}
      textStyle={localStyles.buttonText}
    />
    <BlueButton
      title="SURVEY FACILITIES"
      onPress={onNavigateToSurveysMenu}
      style={[localStyles.button, localStyles.surveyButton]}
      textStyle={localStyles.buttonText}
    />
  </View>
);

HomeToolbar.propTypes = {
  onNavigateToSurveysMenu: PropTypes.func.isRequired,
  onNavigateToTupaiaWebsite: PropTypes.func.isRequired,
  style: ViewPropTypes.style,
};
HomeToolbar.defaultProps = {
  style: {},
};

const { width } = Dimensions.get('window');
const localStyles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    flex: 1,
    width: '100%',
  },
  button: {
    width: 'auto',
    paddingVertical: 0,
    height: 36,
    justifyContent: 'center',
    borderRadius: 4,
  },
  surveyButton: {
    flexGrow: 1,
  },
  exploreButton: {
    marginRight: DEFAULT_PADDING / 2,
    borderColor: THEME_COLOR_TWO,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: width < SMALL_PHONE_WIDTH ? 12 : 16,
  },
});

const mapDispatchToProps = dispatch => ({
  onNavigateToSurveysMenu: () => dispatch(navigateToSurveysMenu()),
  onNavigateToTupaiaWebsite: () => dispatch(navigateToTupaiaWebsite()),
});

export const HomeToolbarContainer = connect(null, mapDispatchToProps)(HomeToolbar);
