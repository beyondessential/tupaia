import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { connect } from 'react-redux';

import { THEME_COLOR_ONE, THEME_FONT_SIZE_ONE } from '../globalStyles';
import { addMessage } from '../messages';
import { formatPlural } from '../utilities';
import { requestWritePermission } from '../utilities/writePermission/permission';
import { Button, Divider, Heading, QrCode, TupaiaBackground } from '../widgets';

const filenameWithExtension = filename => `${filename}.png`;

const shareQrCode = (qrCodeRef, filename) => {
  qrCodeRef.toDataURL(dataURL => {
    const shareOptions = {
      filename: filenameWithExtension(filename),
      type: 'image/*',
      url: `data:image/png;base64,${dataURL}`,
    };
    Share.open(shareOptions);
  });
};

const downloadQrCode = async (qrCodeRef, filename, onSuccess, onFail) => {
  const granted = await requestWritePermission();
  if (!granted) {
    onFail('Permission not granted');
    return;
  }
  qrCodeRef.toDataURL(async dataURL => {
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/${filenameWithExtension(filename)}`;
      await RNFS.writeFile(filePath, dataURL, 'base64');
      await CameraRoll.save(filePath, { album: 'Tupaia MediTrak QR Codes' });
      onSuccess();
    } catch (error) {
      onFail(error.message);
    }
  });
};

const QrCodeScreenComponent = props => {
  const { displayDownloadMessage } = props;
  const { qrCodes = [], onClose = () => {} } = props.navigation.state.params;
  const qrCodeImgsRef = useRef(new Array(qrCodes.length));

  return (
    <TupaiaBackground>
      <Heading
        text={`Share QR ${formatPlural('Code', 'Codes', qrCodes.length)}`}
        style={localStyles.heading}
      />
      <ScrollView>
        {qrCodes.map(({ data, name }, index) => (
          <View key={data} style={localStyles.qrCodeContainer}>
            <QrCode
              getRef={ref => {
                qrCodeImgsRef.current[index] = ref;
              }}
              width={300}
              qrCodeContents={data}
              humanReadableId={name}
            />
            <View style={localStyles.buttonsContainer}>
              <Button
                style={[
                  localStyles.smallButton,
                  localStyles.transparentButton,
                  localStyles.downloadButton,
                ]}
                onPress={() => {
                  downloadQrCode(
                    qrCodeImgsRef.current[index],
                    name,
                    () => displayDownloadMessage('Download successful'),
                    errorMessage => displayDownloadMessage(`Download failed: ${errorMessage}`),
                  );
                }}
                title="Download"
                textStyle={[localStyles.buttonLabel, localStyles.transparentButtonLabel]}
              />
              <Button
                style={localStyles.smallButton}
                onPress={() => {
                  shareQrCode(qrCodeImgsRef.current[index], name);
                }}
                title="Share"
                textStyle={[localStyles.buttonLabel, localStyles.shareButtonLabel]}
              />
            </View>
            <Divider style={localStyles.divider} />
          </View>
        ))}

        <View style={localStyles.buttonsContainer}>
          <Button
            style={[localStyles.transparentButton, localStyles.closeButton]}
            title="Close"
            onPress={onClose}
            textStyle={[localStyles.buttonLabel, localStyles.transparentButtonLabel]}
          />
        </View>
      </ScrollView>
    </TupaiaBackground>
  );
};

QrCodeScreenComponent.propTypes = {
  displayDownloadMessage: PropTypes.func.isRequired,
};

QrCodeScreenComponent.navigationOptions = ({ navigation }) => ({
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
    marginBottom: 20,
    width: 300,
  },
  smallButton: { marginTop: 20, marginBottom: 5, width: 142 },
  downloadButton: { marginRight: 16 },
  buttonLabel: {
    fontWeight: 'bold',
  },
  transparentButton: {
    borderWidth: 1,
    borderColor: THEME_COLOR_ONE,
    backgroundColor: 'transparent',
  },
  transparentButtonLabel: {
    color: THEME_COLOR_ONE,
  },
});

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  displayDownloadMessage: message => dispatch(addMessage('qr_code_download', message)),
});

export const QrCodeScreen = connect(mapStateToProps, mapDispatchToProps)(QrCodeScreenComponent);
