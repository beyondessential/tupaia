/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import RNFS from 'react-native-fs';

export const getFileInDocumentsPath = fileName =>
  `file://${RNFS.DocumentDirectoryPath}/${fileName}`;

export const imageDataIsFileName = imageData =>
  imageData && imageData.length < 100 && imageData.search('.*?.(jpg|png)') !== -1;

/**
 * Get a ReactNative ImageSource object.
 * @param {string} imageData
 * Either a filename inside documents or a base64 string.
 */
export const getImageSourceFromData = imageData => {
  if (typeof imageData === 'string') {
    let uri;

    if (imageDataIsFileName(imageData)) {
      uri = getFileInDocumentsPath(imageData);
    } else {
      uri = `data:image/jpeg;base64,${imageData}`;
    }

    return { uri };
  }

  return imageData;
};
