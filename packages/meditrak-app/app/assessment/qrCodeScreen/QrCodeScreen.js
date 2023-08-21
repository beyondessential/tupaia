/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { StyleSheet } from 'react-native';

import { Heading, TupaiaBackground } from '../../widgets';
import { THEME_FONT_SIZE_ONE } from '../../globalStyles';
import { SingleQrCodeShare } from './SingleQrCodeShare';
import { MultipleQrCodeShare } from './MultipleQrCodeShare';
import { formatPlural } from '../../utilities';

export const QrCodeScreen = props => {
  const { qrCodes = [], onClose = () => {} } = props.navigation.state.params;

  return (
    <TupaiaBackground>
      <Heading
        text={`Share QR ${formatPlural('Code', 'Codes', qrCodes.length)}`}
        style={localStyles.heading}
      />
      {qrCodes.length === 1 ? (
        <SingleQrCodeShare qrCode={qrCodes[0]} onClose={onClose} />
      ) : (
        <MultipleQrCodeShare qrCodes={qrCodes} onClose={onClose} />
      )}
    </TupaiaBackground>
  );
};

QrCodeScreen.navigationOptions = ({ navigation }) => ({
  headerTitle: navigation.state.params.title,
});

const localStyles = StyleSheet.create({
  heading: {
    paddingLeft: 20,
    marginVertical: 30,
    fontSize: THEME_FONT_SIZE_ONE,
    flex: 0,
    textAlign: 'left',
  },
});
