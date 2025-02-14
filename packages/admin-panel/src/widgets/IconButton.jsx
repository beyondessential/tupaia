import MuiIconButton from '@material-ui/core/IconButton';
import styled from 'styled-components';

export const IconButton = styled(MuiIconButton)`
  background-color: #dedee0;
  color: #9aa8b0;
  border-radius: 3px;
  width: 40px;
  height: 40px;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.palette.primary.main};
    color: white;
  }
`;
