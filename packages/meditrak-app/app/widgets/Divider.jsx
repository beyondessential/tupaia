import React from 'react';
import PropTypes from 'prop-types';
import { View, Text } from 'react-native';
import { THEME_COLOR_ONE } from '../globalStyles';

export const Divider = ({ style, color, text }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
    <View style={{ flex: 1, height: 1, backgroundColor: color }} />
    <View>
      {text ? <Text style={{ width: 50, textAlign: 'center', color }}>{text}</Text> : null}
    </View>
    <View style={{ flex: 1, height: 1, backgroundColor: color }} />
  </View>
);

Divider.propTypes = {
  style: PropTypes.object,
  color: PropTypes.string,
  text: PropTypes.string,
};

Divider.defaultProps = {
  style: null,
  color: THEME_COLOR_ONE,
  text: null,
};
