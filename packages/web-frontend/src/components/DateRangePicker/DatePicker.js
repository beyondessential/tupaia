/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import { withStyles } from '@material-ui/core/styles';

export class DatePicker extends PureComponent {
  render() {
    const { label, selectedValue, onChange, menuItems, getFormattedValue } = this.props;
    const inputElement = <StyledInput disableUnderline />;
    return (
      <FormControl fullWidth>
        <InputLabel shrink style={styles.label}>
          {label}
        </InputLabel>
        <StyledSelect
          value={selectedValue}
          onChange={onChange}
          style={styles.select}
          renderValue={value => <span>{getFormattedValue(value)}</span>}
          input={inputElement}
        >
          {menuItems}
        </StyledSelect>
      </FormControl>
    );
  }
}

DatePicker.propTypes = {
  label: PropTypes.string.isRequired,
  selectedValue: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  menuItems: PropTypes.array.isRequired,
  getFormattedValue: PropTypes.func,
};

DatePicker.defaultProps = {
  getFormattedValue: value => value,
};

const LABEL_COLOR = '#757575';
const SELECT_MARGIN = 7;
const StyledSelect = withStyles({
  icon: {
    marginRight: SELECT_MARGIN,
    color: LABEL_COLOR,
  },
})(Select);
const StyledInput = withStyles({
  root: {
    borderBottom: `1px solid ${LABEL_COLOR}`,
  },
})(Input);

const styles = {
  label: {
    color: LABEL_COLOR,
  },
  select: {
    marginRight: SELECT_MARGIN,
  },
};
