import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';

import { useCameraPermission } from 'react-native-vision-camera';
import { DEFAULT_PADDING } from '../../globalStyles';
import { getImageSourceFromData } from '../../utilities';
import { Button, Popup, Text } from '../../widgets';

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

const savePhoto = async (photoData, fileName) => RNFS.copyFile();

const handleImagePickerResponse = async (response, onChangeAnswer, setError) => {
  if (response.didCancel) {
    return; // Do nothing if user cancelled
  }

  if (response.errorMessage) {
    setError(`Error: ${response.errorMessage}`);
    onChangeAnswer(null);
  } else {
    const time = new Date().getTime();
    const fileName = `${time}-response-photo.jpg`;

    const { assets } = response;
    if (!assets || assets.length < 1) {
      return; // Do nothing if user cancelled
    }
    const [asset] = assets;

    await RNFS.copyFile(asset.uri, `${RNFS.DocumentDirectoryPath}/${fileName}`);
    onChangeAnswer(fileName);
    setError(null);
  }
};

export const PhotoQuestion = ({ answer, onChangeAnswer }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [error, setError] = useState(null);
  const { hasPermission, requestPermission } = useCameraPermission();

  const takeAPhoto = async () => {
    setIsModalVisible(false);

    const granted = await requestPermission();
    if (!granted) {
      setError('Camera permission was not granted');
      return;
    }

    const response = await launchCamera({
      mediaType: 'photo',
      saveToPhotos: false,
      selectionLimit: 1,
    });
    await handleImagePickerResponse(response, onChangeAnswer, setError);
  };

  const selectAPhoto = async () => {
    setIsModalVisible(false);

    const granted = await requestPermission();
    if (!granted) {
      setError('Camera permission was not granted');
      return;
    }

    const response = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });
    await handleImagePickerResponse(response, onChangeAnswer, setError);
  };

  return (
    <>
      <Popup visible={isModalVisible} onDismiss={() => setIsModalVisible(false)}>
        <Button title="Take a photo" onPress={takeAPhoto} style={localStyles.button} />
        <Button title="Select a photo" onPress={selectAPhoto} style={localStyles.button} />
      </Popup>
      <DumbPhotoQuestion
        imageData={answer}
        errorMessage={error}
        onPressChoosePhoto={() => setIsModalVisible(true)}
        onPressRemovePhoto={() => onChangeAnswer(null)}
      />
    </>
  );
};

PhotoQuestion.propTypes = {
  answer: PropTypes.string,
  onChangeAnswer: PropTypes.func.isRequired,
};

PhotoQuestion.defaultProps = {
  answer: null,
};
