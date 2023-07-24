/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';

import { Button, QrCode } from '../../widgets';
import { THEME_COLOR_ONE } from '../../globalStyles';
import { shareQrCode } from './shareQrCode';

export const SingleQrCodeShare = ({ qrCode, onClose }) => {
  const qrCodeImgRef = useRef(null);

  return (
    <View style={localStyles.container}>
      <QrCode
        getRef={ref => {
          qrCodeImgRef.current = ref;
        }}
        size={300}
        qrCodeContents={qrCode.id}
        humanReadableId={qrCode.name}
      />

      <View style={localStyles.buttonsContainer}>
        <Button
          style={localStyles.closeButton}
          title="Close"
          onPress={onClose}
          textStyle={localStyles.closeButtonLabel}
        />
        <Button
          style={localStyles.shareButton}
          onPress={() => {
            shareQrCode(qrCodeImgRef.current, qrCode.name);
          }}
          title="Share"
          textStyle={localStyles.shareButtonLabel}
        />
      </View>
    </View>
  );
};

SingleQrCodeShare.propTypes = {
  qrCode: PropTypes.shape({ id: PropTypes.string, name: PropTypes.string }).isRequired,
  onClose: PropTypes.func,
};

SingleQrCodeShare.defaultProps = {
  onClose: () => {},
};

const localStyles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    borderWidth: 1,
    borderColor: THEME_COLOR_ONE,
    backgroundColor: 'transparent',
    width: 142,
    marginTop: 50,
    marginRight: 16,
  },
  closeButtonLabel: {
    color: THEME_COLOR_ONE,
    fontWeight: 'bold',
  },
  shareButton: {
    marginTop: 50,
    width: 142,
  },
  shareButtonLabel: {
    fontWeight: 'bold',
  },
});
