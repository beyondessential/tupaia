/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiCheckbox from '@material-ui/core/Checkbox';
import { CheckboxCheckedIcon } from './CheckboxCheckedIcon';
import { CheckboxUncheckedIcon } from './CheckboxUncheckedIcon';

const StyledCheckbox = styled(MuiCheckbox)`
  .MuiSvgIcon-root {
    color: transparent;
  }
`;

export const Checkbox = checkboxProps => {
  return (
    <StyledCheckbox
      checkedIcon={<CheckboxCheckedIcon />}
      icon={<CheckboxUncheckedIcon />}
      {...checkboxProps}
    />
  );
};
