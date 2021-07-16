/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * HierarchyItem
 *
 * Custom react hierarchy component that is composable enough for Tupaia.
 *
 * @prop {string} label The text to render in the hierarchyItem.
 * @prop {string} nestedMargin Amount of space an item should be nested relative to parent, any valid margin-left value.
 * @prop {array}  nestedItems An array of nested items to render as children. Will render iteractive expand arrow on left if provided.
 * @prop {boolean} isSelected True - render checked box on right; False - render unchecked box on right; null - render neither.
 * @prop {boolean} hasNestedItems Manually tell element to render left side arrow.
 * @prop {function} Icon Custom icon for the hierarchy item
 * All additional props go to material-ui FlatButton component.
 * @return {element} a HierarchyItem react component.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FlatButton from 'material-ui/FlatButton';
import ClosedIcon from 'material-ui/svg-icons/navigation/chevron-right';
import OpenIcon from 'material-ui/svg-icons/navigation/expand-more';
import SelectedIcon from 'material-ui/svg-icons/toggle/radio-button-checked';
import UnSelectedIcon from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ReferenceTooltip, TOOLTIP_ICON_STYLE_OPTIONS } from './ReferenceTooltip';

export class HierarchyItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  onClick() {
    if (this.props.onClick) {
      this.props.onClick();
    }
    this.setState(state => ({ isOpen: !state.isOpen }));
  }

  renderOpenClosedIcon() {
    const { nestedItems, hasNestedItems } = this.props;
    const { isOpen } = this.state;

    const hasChildren = hasNestedItems || (Array.isArray(nestedItems) && nestedItems.length > 0);
    if (!hasChildren) {
      return null;
    }

    const IconComponent = isOpen ? OpenIcon : ClosedIcon;
    return <IconComponent style={styles.buttonIcon} />;
  }

  render() {
    const {
      label,
      style,
      nestedMargin,
      nestedItems,
      isSelected,
      Icon,
      onClick,
      isLoading,
      hasNestedItems,
      info,
      ...otherProps
    } = this.props;
    const { isOpen } = this.state;
    let selectionIcon;

    if (isSelected != null) {
      // Check isSelected specifically for null or undefined, !isSelected would be anything falsy.
      selectionIcon = isSelected ? (
        <SelectedIcon style={styles.buttonIcon} />
      ) : (
        <UnSelectedIcon style={styles.buttonIcon} />
      );
    }

    const loadingSpinner = <CircularProgress style={styles.buttonIcon} size={24} thickness={3} />;
    const childItem = isLoading ? loadingSpinner : nestedItems;
    return (
      <div style={{ ...styles.nestedContainer, ...style, marginLeft: nestedMargin }}>
        <FlatButton
          {...otherProps}
          onClick={() => this.onClick()}
          style={{ minHeight: 36, height: 'auto', padding: '5px 0' }}
        >
          <div style={styles.buttonContentContainer}>
            {this.renderOpenClosedIcon()}
            {Icon && <Icon style={styles.buttonIcon} />}
            {selectionIcon}
            <div style={styles.buttonLabel}>{label}</div>
            {info && info.reference && (
              <ReferenceTooltip
                reference={info.reference}
                iconStyleOption={TOOLTIP_ICON_STYLE_OPTIONS.MAP_OVERLAY}
              />
            )}
          </div>
        </FlatButton>
        {isOpen ? childItem : null}
      </div>
    );
  }
}

const styles = {
  nestedContainer: {
    display: 'flex',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
    flexDirection: 'column',
  },
  buttonContentContainer: {
    display: 'flex',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    flexDirection: 'row',
    flexWrap: 'no-wrap',
    alignItems: 'top',
  },
  buttonLabel: {
    padding: '2px 5px',
    overflow: 'hidden',
    textAlign: 'left',
    lineHeight: '140%',
  },
  buttonIcon: {
    flexShrink: 0,
  },
  spacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
  },
};

HierarchyItem.propTypes = {
  ...FlatButton.propTypes,
  label: PropTypes.string,
  nestedItems: PropTypes.arrayOf(PropTypes.object),
  nestedMargin: PropTypes.string,
  isSelected: PropTypes.bool,
  hasNestedItems: PropTypes.bool,
  isLoading: PropTypes.bool,
  Icon: PropTypes.func,
};

HierarchyItem.defaultProps = {
  willMountFunc: undefined,
};

HierarchyItem.defaultProps = {
  nestedMargin: '24px',
};
