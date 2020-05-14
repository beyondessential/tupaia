/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import MuiCheckbox from '@material-ui/core/Checkbox';
import styled from 'styled-components';

export const Checkbox = styled(MuiCheckbox)`
  &.MuiButtonBase-root:not(.MuiIconButton-colorPrimary) {
    color: ${props => props.theme.palette.text.primary};
  }

  &.Mui-checked:not(.MuiIconButton-colorPrimary) {
    color: ${props => props.theme.palette.text.primary};
  }
`;
