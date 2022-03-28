/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FlatButton from 'material-ui/FlatButton';
import ClosedIcon from '@material-ui/icons/ChevronRight';
import OpenIcon from '@material-ui/icons/ExpandMore';
import SelectedRadioIcon from '@material-ui/icons/RadioButtonChecked';
import UnSelectedRadioIcon from '@material-ui/icons/RadioButtonUnchecked';
import SelectedCheckBoxIcon from '@material-ui/icons/CheckBox';
import UnSelectedCheckBoxIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { ReferenceTooltip } from '@tupaia/ui-components';

export const HierarchyItem = React.memo(
  ({ label, nestedMargin, nestedItems, isCheckBox, isSelected, info, onClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
      if (onClick) {
        onClick();
      }
      setIsOpen(!isOpen);
    };

    const OpenClosedIcon = () => {
      const hasChildren = Array.isArray(nestedItems) && nestedItems.length > 0;
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
        <SelectedIcon style={styles.selectionIcon} />
      ) : (
        <UnSelectedIcon style={styles.selectionIcon} />
      );
    };

    return (
      <div style={{ ...styles.nestedContainer, marginLeft: nestedMargin }}>
        <FlatButton
          onClick={() => handleClick()}
          style={{ minHeight: 36, height: 'auto', padding: '5px 0' }}
        >
          <div style={styles.buttonContentContainer}>
            <OpenClosedIcon />
            {/* Check isSelected specifically for null or undefined, !isSelected would be anything falsy. */}
            {isSelected != null && <SelectionIcon />}
            <div style={styles.buttonLabel}>{label}</div>
            {info && info.reference && (
              <ReferenceTooltip reference={info.reference} iconStyleOption="mayOverlay" />
            )}
          </div>
        </FlatButton>
        {isOpen && nestedItems}
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
    alignItems: 'center',
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
  selectionIcon: {
    fontSize: '14px',
    padding: '0px 5px',
  },
  spacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
  },
};

HierarchyItem.propTypes = {
  label: PropTypes.string,
  nestedItems: PropTypes.arrayOf(PropTypes.object),
  nestedMargin: PropTypes.string,
  isSelected: PropTypes.bool,
  isCheckBox: PropTypes.bool,
  info: PropTypes.string,
  onClick: PropTypes.func,
};

HierarchyItem.defaultProps = {
  nestedMargin: '24px',
  label: null,
  nestedItems: null,
  isSelected: null,
  isCheckBox: null,
  info: null,
  onClick: null,
};
