import styled from 'styled-components';
import ArrowUpward from '@material-ui/icons/ArrowUpward';

export const ScrollToTopButton = styled(ArrowUpward)`
  position: fixed;
  bottom: 29px;
  right: 32px;
  cursor: pointer;
  font-size: 50px;
  color: white;
  padding: 10px;
  background: ${props => props.theme.palette.text.primary};
  border-radius: 3px;
  z-index: 5;
`;
