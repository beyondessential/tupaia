/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '.';
import { THEME_COLOR_ONE, THEME_COLOR_TWO, BORDER_RADIUS } from '../globalStyles';

export const BlueButton = props => {
  const style = [props.style, localStyles.button];
  const textStyle = [props.textStyle, localStyles.text];
  const underlayStyle = [props.style, localStyles.underlay];

  return (
    <View style={underlayStyle}>
      <Button {...props} style={style} textStyle={textStyle} />
    </View>
  );
};

const localStyles = StyleSheet.create({
  button: {
    backgroundColor: THEME_COLOR_TWO,
    // Discard margins, they will be applied to the underlay.
    margin: 0,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  text: {
    color: THEME_COLOR_ONE,
    fontWeight: 'bold',
  },
  underlay: {
    borderRadius: BORDER_RADIUS,
    backgroundColor: THEME_COLOR_TWO,
  },
});

BlueButton.propTypes = {
  style: Button.propTypes.style,
  textStyle: Button.propTypes.textStyle,
};

BlueButton.defaultProps = {
  style: Button.defaultProps.style,
  textStyle: Button.defaultProps.textStyle,
};
