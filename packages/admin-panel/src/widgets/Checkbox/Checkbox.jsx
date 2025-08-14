import React from 'react';
import styled from 'styled-components';
import MuiCheckbox from '@material-ui/core/Checkbox';
import { CheckboxCheckedIcon } from './CheckboxCheckedIcon';
import { CheckboxUncheckedIcon } from './CheckboxUncheckedIcon';

export const Checkbox = styled(MuiCheckbox).attrs(props => ({
  icon: <CheckboxUncheckedIcon fontSize={props.fontSize} />,
  checkedIcon: <CheckboxCheckedIcon fontSize={props.fontSize} />,
}))``;
