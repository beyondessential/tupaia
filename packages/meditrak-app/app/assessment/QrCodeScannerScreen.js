import React, { Component, useState } from 'react';

import { StyleSheet, Text, TouchableOpacity, Linking } from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { Button } from '../widgets';

export const QrCodeScannerScreen = props => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  return isScannerOpen ? (
    <QRCodeScanner onRead={props.onSuccess} flashMode={RNCamera.Constants.FlashMode.auto} />
  ) : (
    <Button
      style={{ marginTop: 50 }}
      onPress={() => {
        setIsScannerOpen(true);
      }}
      title="Scan QR Code"
    />
  );
};

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
});
