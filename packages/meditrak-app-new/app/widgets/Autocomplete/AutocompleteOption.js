import { PropTypes } from 'prop-types';
import React, { PureComponent } from 'react';
import { Text, StyleSheet } from 'react-native';
import { TouchableHighlight } from '../Touchable';
import {
  THEME_FONT_FAMILY,
  THEME_TEXT_COLOR_ONE,
  THEME_FONT_SIZE_ONE,
  getThemeColorOneFaded,
} from '../../globalStyles';

export class AutocompleteOption extends PureComponent {
  handlePress = () => {
    const { onOptionSelected, option } = this.props;
    onOptionSelected(option);
  };

  render() {
    const { option } = this.props;
    return (
      <TouchableHighlight
        style={localStyles.wrapper}
        underlayColor={getThemeColorOneFaded(0.1)}
        analyticsLabel={`Autoselect Option: ${option}`}
        onPress={this.handlePress}
      >
        <Text style={localStyles.optionText}>{option}</Text>
      </TouchableHighlight>
    );
  }
}

AutocompleteOption.propTypes = {
  onOptionSelected: PropTypes.func.isRequired,
  option: PropTypes.string.isRequired,
};

const localStyles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 5,
  },
  optionText: {
    color: THEME_TEXT_COLOR_ONE,
    fontFamily: THEME_FONT_FAMILY,
    fontSize: THEME_FONT_SIZE_ONE,
    padding: 10,
  },
});
