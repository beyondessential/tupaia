/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View } from 'react-native';

import { Icon, TouchableOpacity } from '../widgets';
import { DEFAULT_PADDING, THEME_TEXT_COLOR_ONE, THEME_FONT_SIZE_ONE } from '../globalStyles';

export const ITEM_HEIGHT = 55;

export class EntityItem extends PureComponent {
  onPress = () => {
    const { onPress, entity } = this.props;
    if (onPress) {
      onPress(entity);
    }
  };

  render() {
    const { isSelected, entity, onPress } = this.props;
    const Container = onPress && !isSelected ? TouchableOpacity : View;

    return (
      <Container
        analyticsLabel={`Clinic List: ${entity.name} (${entity.area})`}
        style={isSelected ? localStyles.selectedRow : localStyles.row}
        onPress={this.onPress}
      >
        <Icon
          name="map-marker"
          style={localStyles.rowIcon}
          size={ITEM_HEIGHT - DEFAULT_PADDING * 2}
        />
        <View style={localStyles.rowContent}>
          <Text style={localStyles.entityCellText}>{entity.name}</Text>
          <Text style={localStyles.entityCellSubText}>{entity.area}</Text>
        </View>
      </Container>
    );
  }
}

EntityItem.propTypes = {
  onPress: PropTypes.func.isRequired,
  entity: PropTypes.shape({}).isRequired,
  isSelected: PropTypes.bool,
};

EntityItem.defaultProps = {
  isSelected: false,
};

const localStyles = StyleSheet.create({
  entityCellText: {
    color: THEME_TEXT_COLOR_ONE,
    fontSize: THEME_FONT_SIZE_ONE,
  },
  entityCellSubText: {
    flex: 1,
    color: THEME_TEXT_COLOR_ONE,
    fontSize: 12,
    opacity: 0.8,
    // This marginBottom is to prevent the bottom of text being clipped off by the row paddingVertical on Android.
    marginBottom: -10,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: DEFAULT_PADDING,
    paddingVertical: 10,
    height: ITEM_HEIGHT,
  },
  selectedRow: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    paddingHorizontal: DEFAULT_PADDING,
    paddingVertical: 10,
    height: ITEM_HEIGHT,
  },
  rowContent: {
    flexGrow: 1,
  },
  rowIcon: {
    marginRight: 10,
    marginTop: 1,
  },
});
