/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Heading, Text, TupaiaPin } from '../widgets';
import { getLineHeight, THEME_FONT_SIZE_ONE, THEME_FONT_SIZE_FOUR } from '../globalStyles';

export const SubmitScreen = () => (
  <View style={{ flex: 1 }}>
    <TupaiaPin width={54} height={77} style={localStyles.logo} />
    <Heading text="Submit your survey" style={localStyles.heading} />
    <Text style={localStyles.text}>
      You are now ready to submit your answers to Tupaia. Once submitted, your survey answers will
      be uploaded on your next successful sync.
    </Text>
  </View>
);

const localStyles = StyleSheet.create({
  logo: {
    marginVertical: 20,
  },
  heading: {
    marginVertical: 10,
    fontSize: THEME_FONT_SIZE_FOUR,
    flex: 0,
  },
  text: {
    flex: 1,
    fontSize: THEME_FONT_SIZE_ONE,
    lineHeight: getLineHeight(THEME_FONT_SIZE_ONE),
    marginVertical: 10,
    textAlign: 'center',
  },
});
