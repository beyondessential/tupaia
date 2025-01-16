import { StyleSheet } from 'react-native';

import {
  getThemeColorOneFaded,
  BORDER_RADIUS,
  THEME_COLOR_ONE,
  THEME_COLOR_THREE,
  THEME_COLOR_FIVE,
  THEME_TEXT_COLOR_FOUR,
} from '../../globalStyles';
import { PRIMARY, SECONDARY, STATUS_MESSAGE_ERROR, STATUS_MESSAGE_SUCCESS } from './constants';

export const getMessageStyle = type => {
  switch (type) {
    case STATUS_MESSAGE_SUCCESS:
      return localStyles.successMessage;

    case STATUS_MESSAGE_ERROR:
    default:
      return localStyles.errorMessage;
  }
};

export const getIconStyle = theme => {
  switch (theme) {
    case SECONDARY:
      return iconStyles[SECONDARY];

    case PRIMARY:
    default:
      return iconStyles[PRIMARY];
  }
};

export const getTextStyles = theme => {
  switch (theme) {
    case SECONDARY:
      return textStyles[SECONDARY];

    case PRIMARY:
    default:
      return textStyles[PRIMARY];
  }
};

export const localStyles = StyleSheet.create({
  message: {
    padding: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: getThemeColorOneFaded(0.3),
  },
  errorMessage: {
    backgroundColor: THEME_COLOR_THREE,
  },
  successMessage: {
    backgroundColor: THEME_COLOR_FIVE,
  },
});

const baseIconStyles = { marginRight: 10, marginVertical: 3 };
export const iconStyles = StyleSheet.create({
  [PRIMARY]: {
    ...baseIconStyles,
    fontSize: 14,
    color: 'white',
  },
  [SECONDARY]: { ...baseIconStyles, fontSize: 26, color: '#32B032' },
});

const baseTextStyles = { flex: 1 };
export const textStyles = StyleSheet.create({
  [PRIMARY]: { ...baseTextStyles, color: THEME_COLOR_ONE },
  [SECONDARY]: { ...baseTextStyles, color: THEME_TEXT_COLOR_FOUR, fontWeight: '500' },
});
