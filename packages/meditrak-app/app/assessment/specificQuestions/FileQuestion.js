/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';

import { DEFAULT_PADDING } from '../../globalStyles';
import { Button, Text } from '../../widgets';
import { getFilenameFromUri } from '../../utilities';

const renderFilePickerButton = (onPress, label) => (
  <Button title={label} onPress={onPress} style={localStyles.button} />
);

const DumbFileQuestion = ({ onPressChooseFile, onPressRemoveFile, filename, errorMessage }) => (
  <View style={localStyles.container}>
    {filename !== null && <Text style={localStyles.selectedFile}>{filename}</Text>}
    {filename === null && errorMessage && <Text>{errorMessage}</Text>}
    <View style={localStyles.actions}>
      {renderFilePickerButton(onPressChooseFile, filename === null ? 'Attach file' : 'Change file')}
      {filename !== null && renderFilePickerButton(onPressRemoveFile, 'Remove file')}
    </View>
  </View>
);

DumbFileQuestion.propTypes = {
  onPressChooseFile: PropTypes.func.isRequired,
  onPressRemoveFile: PropTypes.func.isRequired,
  filename: PropTypes.string,
  errorMessage: PropTypes.string,
};

DumbFileQuestion.defaultProps = {
  filename: null,
  errorMessage: null,
};

const BUTTON_SPACING = 5;

const localStyles = StyleSheet.create({
  container: {
    marginTop: DEFAULT_PADDING,
  },
  selectedFile: {
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -BUTTON_SPACING,
    flex: 1,
  },
  button: {
    flex: 1,
    marginHorizontal: BUTTON_SPACING,
  },
});

export const FileQuestion = ({ answer, extraProps, onChangeAnswer }) => {
  const filename = getFilenameFromUri(answer);

  const handleOpenFilePicker = async () => {
    try {
      // We copy the file to document storage (NSDocumentDirectory/getFilesDir on ios/android), which is our application sandboxed file storage.
      // The file may not be available at sync time otherwise.
      // This can fail if there is no disk space.
      // Additionally, a large backlog of files to be synced up will take up a lot of disk space on the device.
      // Finally, we must delete files after we sync them up, or the app will just take up disk space unnecessarily.
      // See https://github.com/rnmods/react-native-document-picker/tree/v8.2.1
      const filePickerResponse = await DocumentPicker.pickSingle({
        copyTo: 'documentDirectory',
      });

      // If we previously picked a file (stored a copy in app documents) and now picked a new one, we need to delete the old copy
      if (answer) {
        try {
          await RNFS.unlink(answer);
        } catch (e) {
          console.warn(`Failed to unlink previously picked file: ${answer}`);
        }
      }

      const { fileCopyUri } = filePickerResponse;

      onChangeAnswer(fileCopyUri);
    } catch (e) {
      onChangeAnswer(null);
    }
  };

  const handleRemoveFile = () => {
    onChangeAnswer(null);
  };

  return (
    <DumbFileQuestion
      filename={filename}
      errorMessage={extraProps.errorMessage}
      onPressChooseFile={handleOpenFilePicker}
      onPressRemoveFile={handleRemoveFile}
    />
  );
};

FileQuestion.propTypes = {
  answer: PropTypes.string,
  onChangeAnswer: PropTypes.func.isRequired,
  extraProps: PropTypes.object,
};

FileQuestion.defaultProps = {
  answer: null,
  extraProps: {},
};
