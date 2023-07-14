/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import Share from 'react-native-share';

import { Button, Heading, QrCode } from '../widgets';
import { THEME_COLOR_ONE, THEME_COLOR_TWO, THEME_FONT_SIZE_ONE } from '../globalStyles';
import { GENERATE_QR_CODE_SUCCESS } from './constants';
import { addMessage } from '../messages';
import { goBack } from '../navigation';
import { stopWatchingUserLocation } from '../utilities/userLocation';

export const QrCodeScreenComponent = ({ data, onClose }) => {
  const [qrCodeImg, setQrCodeImg] = useState(null);

  const openShareScreen = () => {
    qrCodeImg.toDataURL(dataURL => {
      const shareOptions = {
        type: 'image/*',
        url: `data:image/png;base64,${dataURL}`,
      };
      Share.open(shareOptions)
        .then(res => console.log(res))
        .catch(err => console.error(err));
    });
  };

  return (
    <View>
      <Heading text="Share QR Code" style={localStyles.heading} />
      <View style={localStyles.qrCodeContainer}>
        <QrCode
          getRef={c => setQrCodeImg(c)}
          size={280}
          qrCodeContents={data.id}
          humanReadableId={data.name}
        />
      </View>
      <View style={localStyles.buttonsContainer}>
        <Button
          style={localStyles.closeButton}
          title="Close"
          onPress={onClose}
          textStyle={localStyles.closeButtonLabel}
        />
        <Button
          style={localStyles.shareButton}
          onPress={openShareScreen}
          title="Share"
          textStyle={localStyles.shareButtonLabel}
        />
      </View>
    </View>
  );
};

QrCodeScreenComponent.propTypes = {
  data: PropTypes.shape({ id: PropTypes.string, name: PropTypes.string }),
  onClose: PropTypes.func,
};

QrCodeScreenComponent.defaultProps = {
  data: {},
  onClose: () => {},
};

const localStyles = StyleSheet.create({
  qrCodeContainer: {
    display: 'flex',
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
    backgroundColor: THEME_COLOR_TWO,
    marginLeft: 26,
    marginTop: 50,
    width: 150,
  },
  closeButtonLabel: {
    color: THEME_COLOR_ONE,
  },
  shareButton: { marginRight: 26, marginTop: 50, width: 150 },
  shareButtonLabel: {
    fontWeight: 'bold',
  },
  heading: {
    paddingLeft: 20,
    marginVertical: 30,
    fontSize: THEME_FONT_SIZE_ONE,
    flex: 0,
    textAlign: 'left',
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

export const QrCodeScreen = connect(null, mapDispatchToProps)(QrCodeScreenComponent);
