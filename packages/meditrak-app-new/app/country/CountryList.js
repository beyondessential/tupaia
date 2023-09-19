/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

import { Icon, TouchableOpacity } from '../widgets';
import { getGreyShade, DEFAULT_PADDING, THEME_COLOR_DARK, THEME_COLOR_ONE } from '../globalStyles';

export class CountryList extends PureComponent {
  getCountryOptions(whereUserHasPermissionToAccessCountry = true) {
    const { availableCountries, unavailableCountries } = this.props;
    const countries = whereUserHasPermissionToAccessCountry
      ? availableCountries
      : unavailableCountries;

    if (!countries) {
      return [];
    }

    return countries
      .map(country => ({
        key: country.id,
        label: country.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  renderRequestAccessButton() {
    const { onRequestCountryAccess } = this.props;

    return (
      <TouchableOpacity
        onPress={onRequestCountryAccess}
        style={localStyles.option}
        analyticsLabel="Clinic Country List: Request Access"
      >
        <Text style={localStyles.requestAccessButtonText}>Request access to more countries</Text>
      </TouchableOpacity>
    );
  }

  componentDidMount() {
    this.props.onMount();
  }

  render() {
    const { selectedCountryId, onChangeCountry } = this.props;

    const countryAvailableOptions = this.getCountryOptions(true);
    const countryUnavailableOptions = this.getCountryOptions(false);

    return (
      <ScrollView style={localStyles.list}>
        {countryAvailableOptions.map(({ key, label }) => (
          <TouchableOpacity
            analyticsLabel={`Clinic Country List: ${label}`}
            onPress={() => onChangeCountry(key, label)}
            key={key}
            style={localStyles.option}
          >
            <Text style={localStyles.availableOptionText}>{label}</Text>
            {key === selectedCountryId ? (
              <Icon
                name="check"
                color={THEME_COLOR_DARK}
                size={12}
                style={localStyles.selectedIcon}
              />
            ) : null}
          </TouchableOpacity>
        ))}
        {countryUnavailableOptions.map(({ key, label }) => (
          <View key={key} style={localStyles.option}>
            <Text style={localStyles.unavailableOptionText}>{label} (No access)</Text>
          </View>
        ))}
        {countryUnavailableOptions.length > 0 ? this.renderRequestAccessButton() : null}
      </ScrollView>
    );
  }
}

CountryList.propTypes = {
  onChangeCountry: PropTypes.func.isRequired,
  onRequestCountryAccess: PropTypes.func.isRequired,
  availableCountries: PropTypes.array.isRequired,
  unavailableCountries: PropTypes.array.isRequired,
  selectedCountryId: PropTypes.string,
};

CountryList.defaultProps = {
  selectedCountryId: '',
};

const countrySelectionFontSize = 18;
const localStyles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: THEME_COLOR_ONE,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: DEFAULT_PADDING,
    borderBottomWidth: 1,
    borderBottomColor: getGreyShade(0.05),
  },
  availableOptionText: {
    fontSize: countrySelectionFontSize,
    color: THEME_COLOR_DARK,
  },
  unavailableOptionText: {
    fontSize: countrySelectionFontSize,
    color: getGreyShade(0.5),
  },
  selectedIcon: {
    marginRight: 0,
    marginLeft: 'auto',
  },
  requestAccessButtonText: {
    fontSize: countrySelectionFontSize,
    color: THEME_COLOR_DARK,
  },
});
