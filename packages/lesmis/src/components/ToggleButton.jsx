import styled from 'styled-components';
import ToggleButtonComponent from '@material-ui/lab/ToggleButton';
import * as COLORS from '../constants';

export const ToggleButton = styled(ToggleButtonComponent)`
  flex: 1;
  background: white;
  border-color: ${props => props.theme.palette.grey['400']};
  padding: 0.3125rem;

  .MuiSvgIcon-root {
    font-size: 1.2rem;
  }

  &.MuiToggleButtonGroup-groupedHorizontal:not(:first-child) {
    border-color: ${props => props.theme.palette.grey['400']};
  }

  &.MuiToggleButton-root.Mui-selected {
    color: white;
    background: ${props => props.theme.palette.primary.main};
    border-color: ${COLORS.DARK_RED};
  }
`;
