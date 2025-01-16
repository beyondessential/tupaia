import { Checkbox as MuiCheckbox } from '@material-ui/core';
import styled from 'styled-components';

export const Checkbox = styled(MuiCheckbox)`
  width: 20px;

  height: 20px;
  :hover {
    background-color: rgba(0, 0, 0, 0);
  }
  &.Mui-checked {
    &:hover {
      background-color: rgba(0, 0, 0, 0);
    }
  }
  & svg {
    color: ${({ checked }) => (checked ? '#3884b8' : 'default')};
    border-radius: 20%;
  }
`;
