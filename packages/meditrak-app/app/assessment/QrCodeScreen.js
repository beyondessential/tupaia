/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React, { useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Share from 'react-native-share';

import { Button, Divider, Heading, QrCode, TupaiaBackground } from '../widgets';
import { THEME_COLOR_ONE, THEME_COLOR_TWO, THEME_FONT_SIZE_ONE } from '../globalStyles';

export const QrCodeScreen = props => {
  const { qrCodes = [], onClose = () => {} } = props.navigation.state.params;
  const qrCodeImgRefs = useRef(new Array(qrCodes.length));

  const openShareScreen = (index, name) => {
    qrCodeImgRefs.current[index].toDataURL(dataURL => {
      const shareOptions = {
        filename: name,
        type: 'image/*',
        url: `data:image/png;base64,${dataURL}`,
      };
      Share.open(shareOptions);
    });
  };

  return (
    <TupaiaBackground>
      <Heading text="Share QR Codes" style={localStyles.heading} />
      <ScrollView>
        {qrCodes.map(({ id, name }, index) => (
          <View key={id} style={localStyles.qrCodeContainer}>
            <QrCode
              getRef={ref => {
                qrCodeImgRefs.current[index] = ref;
              }}
              size={280}
              qrCodeContents={id}
              humanReadableId={name}
            />
            <Button
              style={localStyles.shareButton}
              onPress={() => {
                openShareScreen(index, name);
              }}
              title="Share"
              textStyle={localStyles.shareButtonLabel}
            />
            {index < qrCodes.length - 1 ? <Divider style={localStyles.divider} /> : null}
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
    </TupaiaBackground>
  );
};

QrCodeScreen.navigationOptions = ({ navigation }) => ({
  headerTitle: navigation.state.params.title,
});

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
    width: 320,
    marginTop: 30,
    marginBottom: 30,
  },
  closeButton: {
    borderWidth: 1,
    borderColor: THEME_COLOR_ONE,
    backgroundColor: THEME_COLOR_TWO,
    marginTop: 30,
    marginBottom: 30,
    width: 300,
  },
  closeButtonLabel: {
    color: THEME_COLOR_ONE,
  },
  shareButton: { marginTop: 30, marginBottom: 5, width: 300 },
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
