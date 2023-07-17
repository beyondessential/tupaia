/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';

import { BlueButton, Button, Heading } from '../widgets';
import { THEME_FONT_SIZE_ONE } from '../globalStyles';
import { GENERATE_QR_CODE_SUCCESS } from './constants';
import { connect } from 'react-redux';
import { addMessage } from '../messages';
import { goBack } from '../navigation';
import { stopWatchingUserLocation } from '../utilities/userLocation';

export const QRCodeScreenComponent = ({ data, onClose }) => {
  const [qrCodeImg, setQrCodeImg] = useState(null);

  const openShareScreen = () => {
    qrCodeImg.toDataURL(dataURL => {
      const shareOptions = {
        type: 'image/*',
        url: `data:image/svg+xml;base64,${dataURL}`,
      };
      Share.open(shareOptions)
        .then(res => console.log(res))
        .catch(err => console.error(err));
    });
  };

  return (
    <View>
      <Heading text="Share QR Code" style={localStyles.heading} />
      <Heading text={data.name} style={localStyles.subHeading} />
      <View style={{ marginLeft: 100 }}>
        <QRCode getRef={c => setQrCodeImg(c)} size={160} value={data.id} />
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <BlueButton
          style={{ marginLeft: 26, marginTop: 50, width: 150 }}
          title="Close"
          onPress={onClose}
        />
        <Button
          style={{ marginRight: 26, marginTop: 50, width: 150 }}
          onPress={openShareScreen}
          title="Share"
        />
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  logo: {
    marginVertical: 20,
  },
  heading: {
    paddingLeft: 20,
    marginVertical: 30,
    fontSize: THEME_FONT_SIZE_ONE,
    flex: 0,
    textAlign: 'left',
  },
  subHeading: {
    marginVertical: 10,
    fontSize: THEME_FONT_SIZE_ONE,
    flex: 0,
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
