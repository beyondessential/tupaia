import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';

import { DEFAULT_PADDING } from '../../globalStyles';
import { Button, Text } from '../../widgets';
import { getFilenameFromUri } from '../../utilities';

/*
 * Limit the max file size to:
 * - Tupaia max request size configured in nginx
 * - A reasonable limit for Android to avoid out of memory issues (around 20 MB as a guess)
 */
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const MAX_FILE_SIZE_HUMAN = '20 MB';

const humanFileSize = sizeInBytes => {
  const i = sizeInBytes === 0 ? 0 : Math.floor(Math.log(sizeInBytes) / Math.log(1024));
  return `${(sizeInBytes / 1024 ** i).toFixed(2) * 1} ${['B', 'kB', 'MB', 'GB', 'TB'][i]}`;
};

const renderFilePickerButton = (onPress, label) => (
  <Button title={label} onPress={onPress} style={localStyles.button} />
);

const DumbFileQuestion = ({
  onPressChooseFile,
  onPressRemoveFile,
  filename,
  errorMessage,
  sizeInBytes,
}) => (
  <View style={localStyles.container}>
    {filename !== null && (
      <Text style={localStyles.selectedFile}>
        {filename} ({humanFileSize(sizeInBytes)})
      </Text>
    )}
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
  sizeInBytes: PropTypes.number,
};

DumbFileQuestion.defaultProps = {
  filename: null,
  errorMessage: null,
  sizeInBytes: null,
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

const unlink = async path => {
  if (!path) {
    console.log('Nothing to unlink, no path');
    return;
  }
  try {
    await RNFS.unlink(path);
    console.log(`Unlinked old file ${path}`);
  } catch (e) {
    console.log(`Failed to unlink previously picked file: ${path}: ${e}`);
  }
};

export const FileQuestion = ({ answer, onChangeAnswer }) => {
  const filename = getFilenameFromUri(answer);

  const [error, setError] = useState(null);
  const [sizeInBytes, setSizeInBytes] = useState(null);

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
      await unlink(answer);

      const { fileCopyUri } = filePickerResponse;

      // Check file size
      // Note: from DocumentPicker docs: android does not guarantee the name or size will be present or accurate on the file picker response, so we read the newly copied file in the app documents which is a normal file
      const { size: newSizeInBytes } = await RNFS.stat(fileCopyUri);
      if (newSizeInBytes > MAX_FILE_SIZE_BYTES) {
        await unlink(fileCopyUri);
        setSizeInBytes(null);
        setError(
          `Error: file is too large: ${humanFileSize(
            newSizeInBytes,
          )}. Max file size: ${MAX_FILE_SIZE_HUMAN}`,
        );
        onChangeAnswer(null);
        return;
      }

      onChangeAnswer(fileCopyUri);
      setSizeInBytes(newSizeInBytes);
    } catch (e) {
      if (DocumentPicker.isCancel(e)) {
        // User cancelled, do nothing
      } else {
        await unlink(answer);
        onChangeAnswer(null);
        setSizeInBytes(null);
        setError(`Error: ${e.message}`);
      }
    }
  };

  const handleRemoveFile = async () => {
    // Unlink first before we lose previous path (answer)
    await unlink(answer);
    onChangeAnswer(null);
    setError(null);
    setSizeInBytes(null);
  };

  return (
    <DumbFileQuestion
      filename={filename}
      errorMessage={error}
      sizeInBytes={sizeInBytes}
      onPressChooseFile={handleOpenFilePicker}
      onPressRemoveFile={handleRemoveFile}
    />
  );
};

FileQuestion.propTypes = {
  answer: PropTypes.string,
  onChangeAnswer: PropTypes.func.isRequired,
};

FileQuestion.defaultProps = {
  answer: null,
};
