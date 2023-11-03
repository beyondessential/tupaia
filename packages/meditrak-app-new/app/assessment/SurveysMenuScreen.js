/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import { Icon, Text, TouchableOpacity, TupaiaPin, TupaiaBackground } from '../widgets';
import {
  DEFAULT_PADDING,
  getGreyShade,
  THEME_COLOR_DARK,
  THEME_FONT_SIZE_THREE,
  THEME_TEXT_COLOR_FOUR,
} from '../globalStyles';
import { TUPAIA_BACKGROUND_THEME } from '../widgets/TupaiaBackground';

import { CountryListContainer } from '../country/CountryListContainer';
import { hideCountryMenu, showCountryMenu } from '../country/actions';

import { SurveysMenu } from './SurveysMenu';

class DumbSurveysMenuScreen extends React.PureComponent {
  static navigationOptions = {
    headerTitle: 'Surveys',
  };

  onToggleCountryMenu = () => {
    const { selectedCountryName, isCountryMenuVisible, setCountryMenuVisible } = this.props;
    const showCountrySelector = !selectedCountryName || isCountryMenuVisible;
    setCountryMenuVisible(!showCountrySelector);
  };

  renderHeader() {
    const { selectedCountryName, isCountryMenuVisible } = this.props;
    const countryIsSelected = !!selectedCountryName;

    return (
      <TouchableOpacity
        analyticsLabel="Survey menu: Country header"
        style={localStyles.countryHeader}
        onPress={this.onToggleCountryMenu}
        activeOpacity={0.9}
        disabled={false}
      >
        <TupaiaPin width={29} height={42} />
        <Text style={localStyles.countryHeaderText}>
          {selectedCountryName || 'Select a country'}
        </Text>
        {countryIsSelected && !isCountryMenuVisible && (
          <View style={localStyles.chooseCountryContainer}>
            <Text style={localStyles.chooseCountryText}>Change country</Text>
            <Icon name="globe" color={THEME_TEXT_COLOR_FOUR} size={20} />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  render() {
    const { navigation, selectedCountryName, isCountryMenuVisible } = this.props;
    const showCountrySelector = !selectedCountryName || isCountryMenuVisible;

    const expandedSurveyGroupId = navigation.state.params.surveyGroupId;
    return (
      <TupaiaBackground theme={TUPAIA_BACKGROUND_THEME.WHITE}>
        {!expandedSurveyGroupId && this.renderHeader()}
        {showCountrySelector ? (
          <CountryListContainer />
        ) : (
          <SurveysMenu expandedSurveyGroupId={expandedSurveyGroupId} />
        )}
      </TupaiaBackground>
    );
  }
}

DumbSurveysMenuScreen.propTypes = {
  selectedCountryName: PropTypes.string,
  isCountryMenuVisible: PropTypes.bool.isRequired,
  setCountryMenuVisible: PropTypes.func.isRequired,
};

DumbSurveysMenuScreen.defaultProps = {
  selectedCountryName: '',
};

export const SurveysMenuScreen = connect(
  state => ({
    isCountryMenuVisible: state.country.isCountryMenuVisible,
    selectedCountryName: state.country.selectedCountryName,
  }),
  dispatch => ({
    setCountryMenuVisible: visible => {
      if (visible) return dispatch(showCountryMenu());
      return dispatch(hideCountryMenu());
    },
  }),
)(DumbSurveysMenuScreen);

const localStyles = StyleSheet.create({
  countryHeader: {
    padding: DEFAULT_PADDING,
    backgroundColor: getGreyShade(0.03),
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: getGreyShade(0.2),
  },
  countryHeaderText: {
    color: THEME_COLOR_DARK,
    fontWeight: 'bold',
    fontSize: THEME_FONT_SIZE_THREE,
    flexGrow: 1,
    paddingLeft: DEFAULT_PADDING,
  },
  chooseCountryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chooseCountryText: {
    fontSize: 12,
    color: THEME_TEXT_COLOR_FOUR,
    paddingRight: 5,
  },
});
