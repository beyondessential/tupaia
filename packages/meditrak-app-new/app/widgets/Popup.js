import React from 'react';
import PropTypes from 'prop-types';
import { KeyboardAvoidingView, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from './Touchable';

import {
  THEME_COLOR_ONE,
  THEME_TEXT_COLOR_THREE,
  THEME_COLOR_SIX,
  DEFAULT_PADDING,
} from '../globalStyles';

export const Popup = ({ children, title, visible, onDismiss }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
    <TouchableOpacity
      analyticsLabel={`Popup: Dismiss ${title}`}
      style={styles.overlay}
      onPress={onDismiss}
      activeOpacity={0.9}
    />
    <KeyboardAvoidingView style={styles.popupWrapper} pointerEvents="box-none" behavior="padding">
      <View style={styles.popup}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

Popup.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  title: PropTypes.string,
  onDismiss: PropTypes.func.isRequired,
  visible: PropTypes.bool,
};

Popup.defaultProps = {
  children: [],
  title: '',
  visible: false,
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  popupWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 25,
  },
  popup: {
    shadowOffset: { width: 0, height: 0 },
    shadowColor: THEME_COLOR_SIX,
    shadowOpacity: 0.3,
    shadowRadius: 1,
    backgroundColor: THEME_COLOR_ONE,
    borderRadius: 6,
    maxHeight: '80%',
    width: '100%',
  },
  content: {
    padding: DEFAULT_PADDING,
  },
  title: {
    color: THEME_TEXT_COLOR_THREE,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: 'transparent',
    padding: DEFAULT_PADDING,
    paddingBottom: 0,
  },
});
