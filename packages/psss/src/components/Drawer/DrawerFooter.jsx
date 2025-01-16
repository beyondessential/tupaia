import styled from 'styled-components';
import * as COLORS from '../../constants';

export const DrawerFooter = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  background: ${COLORS.LIGHTGREY};
  text-align: center;
  box-shadow: 0px -1px 0px ${COLORS.GREY_DE};
  padding: 1.5rem;
  z-index: 100;

  &:after {
    display: ${props => (props.disabled ? 'block' : 'none')};
    position: absolute;
    content: '';
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    opacity: 0.5;
  }
`;
