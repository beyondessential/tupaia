/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import styled from 'styled-components';
import ToggleButtonComponent from '@material-ui/lab/ToggleButton';
import ToggleButtonGroupComponent from '@material-ui/lab/ToggleButtonGroup';

export const ToggleButtonGroup = styled(ToggleButtonGroupComponent)`
  //margin-top: 0.8rem;
`;

export const ToggleButton = styled(ToggleButtonComponent)`
  flex: 1;
  background: white;
  border-color: ${props => props.theme.palette.grey['400']};
  padding: 5px;

  .MuiSvgIcon-root {
    font-size: 1.2rem;
  }

  &.MuiToggleButtonGroup-groupedHorizontal:not(:first-child) {
    border-color: ${props => props.theme.palette.grey['400']};
  }

  &.MuiToggleButton-root.Mui-selected {
    color: white;
    background: ${props => props.theme.palette.primary.main};
    border-color: #b22b2b;
  }
`;
