import React from 'react';
import PropTypes from 'prop-types';
import MuiDrawer from '@material-ui/core/Drawer';
import styled from 'styled-components';
import * as COLORS from '../../constants';

const DrawerContent = styled.div`
  flex: 1;
  background: ${COLORS.WHITE};
  overflow: auto;
`;

const drawerWidth = '515px';

export const StyledDrawer = styled(MuiDrawer)`
  .MuiBackdrop-root {
    background-color: rgba(0, 0, 0, 0.35);
  }

  .MuiDrawer-paper {
    width: ${drawerWidth};
  }
`;

export const Drawer = ({ anchor, children, ...props }) => (
  <StyledDrawer anchor={anchor} {...props}>
    <DrawerContent>{children}</DrawerContent>
  </StyledDrawer>
);

Drawer.propTypes = {
  anchor: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Drawer.defaultProps = {
  anchor: 'right',
};
