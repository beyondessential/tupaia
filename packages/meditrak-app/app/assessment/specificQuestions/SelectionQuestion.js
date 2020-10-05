/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 * */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';

import { MenuItem } from '../../widgets';
import { THEME_TEXT_COLOR_ONE, THEME_FONT_SIZE_ONE } from '../../globalStyles';

export const SelectionQuestion = ({ options, onChangeAnswer }) => (
  <View style={[localStyles.container]}>
    {options.map(option => {
      const { text, value } = option;

      return (
        <MenuItem text={text} style={localStyles.menuText} onPress={() => onChangeAnswer(value)} />
      );
    })}
  </View>
);

SelectionQuestion.propTypes = {
  options: PropTypes.array.isRequired,
  onChangeAnswer: PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuText: {
    color: THEME_TEXT_COLOR_ONE,
    fontSize: THEME_FONT_SIZE_ONE,
  },
});
