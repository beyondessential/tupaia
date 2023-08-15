/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, Divider, QrCode } from '../../widgets';
import { THEME_COLOR_ONE } from '../../globalStyles';
import { shareQrCode } from './shareQrCode';

export const MultipleQrCodeShare = ({ qrCodes, onClose }) => {
  const qrCodeImgRefs = useRef(new Array(qrCodes.length));

  return (
    <ScrollView>
      {qrCodes.map(({ data, name }, index) => (
        <View key={data} style={localStyles.qrCodeContainer}>
          <QrCode
            getRef={ref => {
              qrCodeImgRefs.current[index] = ref;
            }}
            width={300}
            qrCodeContents={data}
            humanReadableId={name}
          />
          <Button
            style={localStyles.shareButton}
            onPress={() => {
              shareQrCode(qrCodeImgRefs.current[index], name);
            }}
            title="Share"
            textStyle={localStyles.shareButtonLabel}
          />
          <Divider style={localStyles.divider} />
        </View>
      ))}

      <View style={localStyles.buttonsContainer}>
        <Button
          style={localStyles.closeButton}
          title="Close"
          onPress={onClose}
          textStyle={localStyles.closeButtonLabel}
        />
      </View>
    </ScrollView>
  );
};

MultipleQrCodeShare.propTypes = {
  qrCodes: PropTypes.arrayOf(
    PropTypes.shape({ data: PropTypes.string, name: PropTypes.string }).isRequired,
  ).isRequired,
  onClose: PropTypes.func,
};

MultipleQrCodeShare.defaultProps = {
  onClose: () => {},
};

const localStyles = StyleSheet.create({
  qrCodeContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    width: 300,
    marginTop: 20,
    marginBottom: 20,
  },
  closeButton: {
    borderWidth: 1,
    borderColor: THEME_COLOR_ONE,
    backgroundColor: 'transparent',
    marginBottom: 20,
    width: 300,
  },
  closeButtonLabel: {
    color: THEME_COLOR_ONE,
    fontWeight: 'bold',
  },
  shareButton: { marginTop: 20, marginBottom: 5, width: 300 },
  shareButtonLabel: {
    fontWeight: 'bold',
  },
});
