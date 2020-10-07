/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';

import { extractOptionDetails } from './utilities';
import { TouchableOpacity } from '../../widgets';
import { DEFAULT_PADDING, THEME_TEXT_COLOR_ONE, THEME_FONT_SIZE_ONE } from '../../globalStyles';

const ITEM_HEIGHT = 55;

export const SelectionQuestion = ({ answer, options, onChangeAnswer }) => {
  return (
    <View style={[localStyles.container]}>
      {options.map(option => {
        const { label, value } = extractOptionDetails(option);
        const isSelected = answer === value;
        const Container = isSelected ? View : TouchableOpacity;

        return (
          <Container
            key={value}
            analyticsLabel={`Selection: ${label}`}
            style={isSelected ? localStyles.selectedRow : localStyles.row}
            onPress={() => onChangeAnswer(value)}
          >
            <View style={localStyles.rowContent}>
              <Text style={localStyles.menuText}>{label}</Text>
            </View>
          </Container>
        );
      })}
    </View>
  );
};

SelectionQuestion.propTypes = {
  answer: PropTypes.string,
  options: PropTypes.array.isRequired,
  onChangeAnswer: PropTypes.func.isRequired,
};

SelectionQuestion.defaultProps = {
  answer: '',
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuText: {
    color: THEME_TEXT_COLOR_ONE,
    fontSize: THEME_FONT_SIZE_ONE,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: DEFAULT_PADDING,
    paddingVertical: 10,
    height: ITEM_HEIGHT,
  },
  selectedRow: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    paddingHorizontal: DEFAULT_PADDING,
    paddingVertical: 10,
    height: ITEM_HEIGHT,
  },
  rowContent: {
    flexGrow: 1,
  },
});
