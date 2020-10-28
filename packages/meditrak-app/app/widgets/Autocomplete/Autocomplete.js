/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, StyleSheet, FlatList, TextInput, Platform, Text } from 'react-native';
import { takeScrollControl, releaseScrollControl } from '../../assessment/actions';
import {
  THEME_FONT_FAMILY,
  THEME_TEXT_COLOR_ONE,
  getThemeColorOneFaded,
  THEME_FONT_SIZE_ONE,
} from '../../globalStyles';
import { AutocompleteOption } from './AutocompleteOption';
import { Icon } from '../Icon';

class AutocompleteComponent extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isFocused: false,
      searchTerm: '',
    };
  }

  handleFocus = () => {
    this.setState({
      isFocused: true,
    });
  };

  handleBlur = () => {
    this.setState({
      isFocused: false,
    });
  };

  clearSelection = () => {
    const { handleSelectOption, handleChangeInput } = this.props;
    handleSelectOption(null);
    handleChangeInput('');
    this.setState({ searchTerm: '' });
  };

  onChangeInput = searchTerm => {
    const { handleSelectOption, selectedOption, handleChangeInput } = this.props;
    if (selectedOption) handleSelectOption(null);
    handleChangeInput(searchTerm);
    this.setState({ searchTerm });
  };

  onOptionPress = option => {
    this.props.handleSelectOption(option);
  };

  onEndReached = () => {
    const { handleEndReached } = this.props;
    if (handleEndReached) handleEndReached();
  };

  render() {
    const { searchTerm, isFocused } = this.state;
    const {
      placeholder,
      selectedOption,
      options,
      endReachedOffset,
      takeScrollControl,
      releaseScrollControl,
    } = this.props;
    return (
      <View style={localStyles.wrapper}>
        <Icon
          name="search"
          size={20}
          style={localStyles.searchIcon}
          onPress={this.clearSelection}
        />
        <TextInput
          onChangeText={this.onChangeInput}
          value={selectedOption || searchTerm}
          selectTextOnFocus
          onFocus={() => {
            takeScrollControl();
            this.handleFocus();
          }}
          onBlur={() => {
            releaseScrollControl();
            this.handleBlur();
          }}
          placeholder={placeholder}
          placeholderTextColor={getThemeColorOneFaded(0.7)}
          style={[
            localStyles.textInput,
            Platform.OS === 'ios' && localStyles.textInputFixedHeight,
            localStyles.textInput,
            isFocused ? localStyles.textInputFocussed : {},
          ]}
        />
        <Icon name="times" size={20} style={localStyles.clearIcon} onPress={this.clearSelection} />
        {!selectedOption && options.length > 0 && (
          <View style={{ flex: 1 }}>
            <FlatList
              data={options}
              onEndReached={this.onEndReached}
              onEndReachedThreshold={endReachedOffset}
              keyExtractor={item => item}
              ItemSeparatorComponent={() => <View style={localStyles.separator} />}
              renderItem={({ item }) => (
                <AutocompleteOption onOptionSelected={this.onOptionPress} option={item} />
              )}
              style={localStyles.optionList}
            />
          </View>
        )}
        {options.length === 0 && <Text style={localStyles.noResultsText}>No results found.</Text>}
      </View>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  takeScrollControl: () => dispatch(takeScrollControl()),
  releaseScrollControl: () => dispatch(releaseScrollControl()),
});

export const Autocomplete = connect(null, mapDispatchToProps)(AutocompleteComponent);

Autocomplete.propTypes = {
  placeholder: PropTypes.string,
  selectedOption: PropTypes.string,
  handleSelectOption: PropTypes.func.isRequired,
  handleChangeInput: PropTypes.func.isRequired,
  handleEndReached: PropTypes.func,
  takeScrollControl: PropTypes.func,
  releaseScrollControl: PropTypes.func,
  endReachedOffset: PropTypes.number,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
};

Autocomplete.defaultProps = {
  placeholder: 'Search options...',
  selectedOption: '',
  handleEndReached: null,
  endReachedOffset: 0,
};

const localStyles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 10,
    position: 'relative',
  },
  separator: {
    backgroundColor: getThemeColorOneFaded(0.8),
    height: 1,
    marginLeft: 5,
    marginRight: 5,
  },
  textInputFocussed: {
    borderBottomColor: 'white',
  },
  textInput: {
    color: THEME_TEXT_COLOR_ONE,
    fontFamily: THEME_FONT_FAMILY,
    fontSize: THEME_FONT_SIZE_ONE,
    paddingVertical: 10,
    position: 'relative',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    paddingRight: 35,
    paddingLeft: 35,
  },
  textInputFixedHeight: {
    height: 40,
  },
  optionList: {
    height: 200,
    flex: 1,
  },
  clearIcon: {
    position: 'absolute',
    padding: 10,
    right: 0,
  },
  searchIcon: {
    position: 'absolute',
    padding: 10,
    left: 0,
  },
  noResultsText: {
    color: getThemeColorOneFaded(0.7),
    fontFamily: THEME_FONT_FAMILY,
    fontSize: THEME_FONT_SIZE_ONE,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 10,
  },
});
