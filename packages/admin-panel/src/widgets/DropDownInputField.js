/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

export class DropDownInputField extends React.PureComponent {
  render() {
    const { options, onChange, disabled, value } = this.props;
    return (
      <Select
        value={value}
        onChange={({ value: selectedValue }) => {
          onChange(selectedValue);
        }}
        options={options}
        disabled={disabled}
        clearable={false}
      />
    );
  }
}

DropDownInputField.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.any,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

DropDownInputField.defaultProps = {
  value: null,
  disabled: false,
};
