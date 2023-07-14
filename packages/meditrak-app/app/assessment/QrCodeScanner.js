import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { StyleSheet } from 'react-native';

import Scanner from 'react-native-qrcode-scanner';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RNCamera } from 'react-native-camera';
import { Button } from '../widgets';
import { THEME_COLOR_ONE, THEME_COLOR_TWO } from '../globalStyles';

export const QrCodeScanner = ({ onRead, onStartScan, onFinishScan }) => {
  const [isScanningQrCode, setIsScanningQrCode] = useState(false);

  const CancelScanButton = (
    <Button
      style={localStyles.cancelQrCodeScannerButton}
      onPress={() => {
        onFinishScan();
        setIsScanningQrCode(false);
      }}
      title={null}
      Icon={<Icon name="close" color={THEME_COLOR_ONE} size={24} />}
    />
  );

  if (isScanningQrCode) {
    return (
      <Scanner
        style={localStyles.qrCodeScanner}
        onRead={({ data }) => {
          onRead(data);
          onFinishScan();
          setIsScanningQrCode(false);
        }}
        flashMode={RNCamera.Constants.FlashMode.auto}
        topContent={CancelScanButton}
      />
    );
  }

  const QrCodeIcon = (
    <Icon
      name="qr-code-scanner"
      color={THEME_COLOR_TWO}
      size={24}
      style={localStyles.qrCodeButtonLabelIcon}
    />
  );

  return (
    <Button
      style={localStyles.qrCodeButton}
      onPress={() => {
        onStartScan();
        setIsScanningQrCode(true);
      }}
      Icon={QrCodeIcon}
      title="Scan QR Code"
      textStyle={localStyles.qrCodeButtonLabelText}
    />
  );
};

QrCodeScanner.propTypes = {
  onRead: PropTypes.func,
  onStartScan: PropTypes.func,
  onFinishScan: PropTypes.func,
};

QrCodeScanner.defaultProps = {
  onRead: () => {},
  onStartScan: () => {},
  onFinishScan: () => {},
};

const localStyles = StyleSheet.create({
  qrCodeButton: {
    marginTop: 15,
    marginBottom: 15,
    paddingTop: 15,
    paddingBottom: 15,
    width: '100%',
  },
  qrCodeButtonLabelIcon: {
    paddingRight: 3,
    fontWeight: 'bold',
  },
  qrCodeButtonLabelText: {
    fontWeight: 'bold',
  },
  qrCodeScanner: {
    position: 'relative',
  },
  cancelQrCodeScannerButton: {
    width: 30,
    height: 30,
    backgroundColor: 'transparent',
    paddingVertical: 3,
    paddingHorizontal: 0,
    zIndex: 1,
    position: 'absolute',
    right: 35,
    top: 5,
  },
  cancelQrCodeScannerButtonLabelText: {
    color: THEME_COLOR_ONE,
  },
});
