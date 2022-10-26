/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-qr-code';

import { Button, Heading, Text, TupaiaPin } from '../widgets';
import { getLineHeight, THEME_FONT_SIZE_ONE, THEME_FONT_SIZE_FOUR } from '../globalStyles';
import { GENERATE_QR_CODE, GENERATE_QR_CODE_SUCCESS } from './constants';
import { connect } from 'react-redux';
import { addMessage } from '../messages';
import { goBack } from '../navigation';
import { stopWatchingUserLocation } from '../utilities/userLocation';

export const QRCodeScreenComponent = ({ data, onClose }) => (
  <View>
    <TupaiaPin width={54} height={77} style={localStyles.logo} />
    <Heading text="QR Code Screen" style={localStyles.heading} />
    <Heading text={data.name} style={localStyles.heading} />
    <View style={{ marginLeft: 100 }}>
      <QRCode size={150} value={data.id} viewBox={`0 0 150 150`} />
    </View>
    <Button style={{ marginTop: 50 }} title="Share" />
    <Button style={{ marginTop: 50 }} onPress={onClose} title="Close" />
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

const mapDispatchToProps = dispatch => ({
  onClose: () => {
    dispatch({ type: GENERATE_QR_CODE_SUCCESS });
    dispatch(addMessage('submit_survey', 'Survey submitted'));
    dispatch(stopWatchingUserLocation());
    dispatch(goBack(false));
  },
});

export const QRCodeScreen = connect(null, mapDispatchToProps)(QRCodeScreenComponent);
