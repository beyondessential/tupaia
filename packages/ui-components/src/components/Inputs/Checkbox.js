/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiCheckbox from '@material-ui/core/Checkbox';

export const Checkbox = () => {
  const [checked, setChecked] = React.useState(true);

  const handleChange = event => {
    setChecked(event.target.checked);
  };

  return (
    <div>
      <MuiCheckbox
        checked={checked}
        onChange={handleChange}
        inputProps={{ 'aria-label': 'primary checkbox' }}
      />
      <MuiCheckbox
        defaultChecked
        color="primary"
        inputProps={{ 'aria-label': 'secondary checkbox' }}
      />
      <MuiCheckbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }} />
      <MuiCheckbox disabled inputProps={{ 'aria-label': 'disabled checkbox' }} />
      <MuiCheckbox disabled checked inputProps={{ 'aria-label': 'disabled checked checkbox' }} />
      <MuiCheckbox
        defaultChecked
        indeterminate
        inputProps={{ 'aria-label': 'indeterminate checkbox' }}
      />
      <MuiCheckbox
        defaultChecked
        color="default"
        inputProps={{ 'aria-label': 'checkbox with default color' }}
      />
      <MuiCheckbox
        defaultChecked
        size="small"
        inputProps={{ 'aria-label': 'checkbox with small size' }}
      />
    </div>
  );
};
