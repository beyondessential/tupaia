/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import ImagePicker from 'react-native-image-picker';
import RNFS from 'react-native-fs';

import { DEFAULT_PADDING } from '../../globalStyles';
import { getImageSourceFromData } from '../../utilities';
import { Button, Text } from '../../widgets';

const IMAGE_QUALITY = 0.2;

const renderImageButton = (onPress, label) => (
  <Button title={label} onPress={onPress} style={localStyles.button} />
);

const renderImage = imageData => (
  <View style={[localStyles.image, localStyles.imageBorder, localStyles.imageContainer]}>
    <Image
      style={localStyles.image}
      source={getImageSourceFromData(imageData)}
      resizeMode="cover"
    />
  </View>
);

const DumbPhotoQuestion = ({ onPressChoosePhoto, onPressRemovePhoto, imageData, errorMessage }) => (
  <View style={localStyles.container}>
    {imageData !== null && renderImage(imageData)}
    {imageData === null && errorMessage && <Text>{errorMessage}</Text>}
    <View style={localStyles.actions}>
      {renderImageButton(onPressChoosePhoto, imageData === null ? 'Add photo' : 'Change photo')}
      {imageData !== null && renderImageButton(onPressRemovePhoto, 'Remove photo')}
    </View>
  </View>
);

DumbPhotoQuestion.propTypes = {
  onPressChoosePhoto: PropTypes.func.isRequired,
  onPressRemovePhoto: PropTypes.func.isRequired,
  imageData: PropTypes.string,
  errorMessage: PropTypes.string,
};

DumbPhotoQuestion.defaultProps = {
  imageData: null,
  errorMessage: null,
};

const IMAGE_WIDTH = Dimensions.get('window').width * 0.6;
const BUTTON_SPACING = 5;

const localStyles = StyleSheet.create({
  container: {
    marginTop: DEFAULT_PADDING,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: IMAGE_WIDTH,
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

const savePhoto = async (photoData, fileName) =>
  RNFS.writeFile(`${RNFS.DocumentDirectoryPath}/${fileName}`, photoData, 'base64');

const handleImagePickerResponse = async (response, onChangeAnswer, onChangeExtraProps) => {
  if (response.didCancel) {
    return; // Do nothing if user cancelled
  }

  if (response.error) {
    onChangeExtraProps({
      errorMessage: response.error,
    });
    onChangeAnswer(null);
  } else {
    const time = new Date().getTime();
    const fileName = `${time}-response-photo.jpg`;

    await savePhoto(response.data, fileName);
    onChangeAnswer(fileName);
  }
};

export const PhotoQuestion = ({ answer, extraProps, onChangeAnswer, onChangeExtraProps }) => (
  <DumbPhotoQuestion
    imageData={answer}
    errorMessage={extraProps.errorMessage}
    onPressChoosePhoto={() => {
      ImagePicker.showImagePicker(
        {
          quality: IMAGE_QUALITY,
        },
        response => handleImagePickerResponse(response, onChangeAnswer, onChangeExtraProps),
      );
    }}
    onPressRemovePhoto={() => onChangeAnswer(null)}
  />
);

PhotoQuestion.propTypes = {
  answer: PropTypes.string,
  onChangeAnswer: PropTypes.func.isRequired,
  onChangeExtraProps: PropTypes.func.isRequired,
  extraProps: PropTypes.object,
};

PhotoQuestion.defaultProps = {
  answer: null,
  extraProps: {},
};
