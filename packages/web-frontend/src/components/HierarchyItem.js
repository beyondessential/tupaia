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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FlatButton from 'material-ui/FlatButton';
import ClosedIcon from 'material-ui/svg-icons/navigation/chevron-right';
import OpenIcon from 'material-ui/svg-icons/navigation/expand-more';
import SelectedRadioIcon from 'material-ui/svg-icons/toggle/radio-button-checked';
import UnSelectedRadioIcon from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import SelectedCheckBoxIcon from 'material-ui/svg-icons/toggle/check-box';
import UnSelectedCheckBoxIcon from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ReferenceTooltip } from '@tupaia/ui-components';

export const HierarchyItem = React.memo(
  ({
    label,
    style,
    nestedMargin,
    nestedItems,
    isCheckBox,
    isSelected,
    Icon,
    isLoading,
    hasNestedItems,
    info,
    onClick,
    dispatch,
    ...otherProps
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
      if (onClick) {
        onClick();
      }
      setIsOpen(!isOpen);
    };

    const OpenClosedIcon = () => {
      const hasChildren = hasNestedItems || (Array.isArray(nestedItems) && nestedItems.length > 0);
      if (!hasChildren) {
        return null;
      }

      const IconComponent = isOpen ? OpenIcon : ClosedIcon;
      return <IconComponent style={styles.buttonIcon} />;
    };

    const SelectionIcon = () => {
      const SelectedIcon = isCheckBox ? SelectedCheckBoxIcon : SelectedRadioIcon;
      const UnSelectedIcon = isCheckBox ? UnSelectedCheckBoxIcon : UnSelectedRadioIcon;
      return isSelected ? (
        <SelectedIcon style={styles.buttonIcon} />
      ) : (
        <UnSelectedIcon style={styles.buttonIcon} />
      );
    };

    const loadingSpinner = <CircularProgress style={styles.buttonIcon} size={24} thickness={3} />;
    const childItem = isLoading ? loadingSpinner : nestedItems;

    return (
      <div style={{ ...styles.nestedContainer, ...style, marginLeft: nestedMargin }}>
        <FlatButton
          {...otherProps}
          onClick={() => handleClick()}
          style={{ minHeight: 36, height: 'auto', padding: '5px 0' }}
        >
          <div style={styles.buttonContentContainer}>
            <OpenClosedIcon />
            {Icon && <Icon style={styles.buttonIcon} />}
            {/* Check isSelected specifically for null or undefined, !isSelected would be anything falsy. */}
            {isSelected != null && <SelectionIcon />}
            <div style={styles.buttonLabel}>{label}</div>
            {info && info.reference && (
              <ReferenceTooltip reference={info.reference} iconStyleOption="mayOverlay" />
            )}
          </div>
        </FlatButton>
        {isOpen ? childItem : null}
      </div>
    );
  },
);

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
  nestedMargin: '24px',
};
