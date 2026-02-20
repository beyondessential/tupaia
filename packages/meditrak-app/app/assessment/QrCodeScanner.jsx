import React, { useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';

import { StyleSheet, View } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import { Button, STATUS_MESSAGE_ERROR, StatusMessage, Text } from '../widgets';
import { THEME_COLOR_ONE, THEME_COLOR_TWO } from '../globalStyles';

export const QrCodeScanner = ({ onRead, onStartScan, onFinishScan }) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');

  const [isScanningQrCode, setIsScanningQrCode] = useState(false);
  const [error, setError] = useState(null);

  const getPermissionAndStartScan = async () => {
    const granted = await requestPermission();
    if (!granted) {
      setError('Camera permission was not granted');
      setIsScanningQrCode(false);
      return;
    }
    onStartScan();
    setError(null);
    setIsScanningQrCode(true);
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      const [code] = codes;
      try {
        onRead(code.value);
      } catch (e) {
        setError(e.message);
      }
      onFinishScan();
      setIsScanningQrCode(false);
    },
  });

  if (hasPermission && isScanningQrCode) {
    if (device == null) return <Text>No Camera detected on this device</Text>;
    return (
      <View style={localStyles.scannerView}>
        <Button
          style={localStyles.cancelButton}
          onPress={() => {
            onFinishScan();
            setIsScanningQrCode(false);
          }}
          title=" "
          Icon={<Icon name="close" color={THEME_COLOR_ONE} size={24} />}
        />
        <View style={localStyles.cameraView}>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive
            codeScanner={codeScanner}
          />
        </View>
      </View>
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
    <>
      {error ? (
        <StatusMessage
          style={localStyles.errorMessage}
          type={STATUS_MESSAGE_ERROR}
          message={error}
        />
      ) : null}
      <Button
        style={localStyles.qrCodeButton}
        onPress={getPermissionAndStartScan}
        Icon={QrCodeIcon}
        title="Scan QR Code"
        textStyle={localStyles.qrCodeButtonLabelText}
      />
    </>
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
  errorMessage: {
    marginBottom: 0,
  },
  qrCodeButtonLabelIcon: {
    paddingRight: 3,
    fontWeight: 'bold',
  },
  qrCodeButtonLabelText: {
    fontWeight: 'bold',
  },
  cancelButton: {
    width: 30,
    height: 30,
    backgroundColor: 'transparent',
    paddingVertical: 3,
    paddingHorizontal: 0,
    zIndex: 1,
    position: 'absolute',
    right: 10,
    top: 5,
  },
  requestPermissionButton: {
    marginTop: 15,
    marginBottom: 15,
    paddingTop: 15,
    paddingBottom: 15,
    width: '100%',
  },
  scannerView: {
    width: '100%',
    height: 400,
    position: 'relative',
  },
  cameraView: {
    width: '100%',
    height: 400,
    position: 'relative', // camera will absolute fill this space
    borderColor: 'transparent', // hack to get camera layout to behave
    borderWidth: 1, // hack to get camera layout to behave
  },
});
