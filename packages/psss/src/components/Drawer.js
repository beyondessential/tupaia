/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import MuiDrawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import MuiAvatar from '@material-ui/core/Avatar';
import { Close } from '@material-ui/icons';
import styled from 'styled-components';
import { LightIconButton } from '@tupaia/ui-components';
import * as COLORS from '../constants/colors';

export default {
  title: 'Drawer',
};

const Header = styled.div`
  display: flex;
  flex-direction: column;
  background: ${props => props.color};
  color: ${COLORS.WHITE};
  height: 250px;
  text-align: center;
  padding: 0 1.25rem 0.5rem;
`;

const HeaderTray = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  text-transform: uppercase;
  padding: 0.5rem 0;
`;

const TrayHeading = styled.span`
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1rem;
`;

export const DrawerHeader = ({ heading, color, Icon, onClose, children }) => (
  <Header color={color}>
    <HeaderTray>
      <TrayHeading>
        {Icon && <Icon />} {heading}
      </TrayHeading>
      <LightIconButton onClick={onClose}>
        <Close />
      </LightIconButton>
    </HeaderTray>
    {children}
  </Header>
);

DrawerHeader.propTypes = {
  heading: PropTypes.string.isRequired,
  color: PropTypes.string,
  Icon: PropTypes.any,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.any.isRequired,
};

DrawerHeader.defaultProps = {
  color: COLORS.BLUE,
  Icon: null,
};

const HeaderContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const HeaderInner = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  margin-left: 1rem;
`;

const HeaderHeading = styled(Typography)`
  font-weight: 500;
  font-size: 2rem;
  line-height: 2.3rem;
  margin-bottom: 0.3rem;
`;

const HeaderSubHeading = styled(Typography)`
  font-weight: 500;
  font-size: 1.125rem;
  line-height: 1.3rem;
`;

const Avatar = styled(MuiAvatar)`
  height: 5rem;
  width: 5rem;
  margin-right: 0.9rem;
  color: white;
`;

export const DrawerHeaderContent = ({ heading, date, avatarUrl }) => (
  <HeaderContent>
    <HeaderInner>
      <Avatar src={avatarUrl} />
      <div>
        <HeaderHeading>{heading}</HeaderHeading>
        <HeaderSubHeading>{date}</HeaderSubHeading>
      </div>
    </HeaderInner>
  </HeaderContent>
);

DrawerHeaderContent.propTypes = {
  heading: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
};

DrawerHeaderContent.defaultProps = {
  avatarUrl: null,
};

const DrawerFooterHeight = '125px';

const StyledFooter = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  background: ${COLORS.LIGHTGREY};
  height: ${DrawerFooterHeight};
  text-align: center;
  padding: 1.5rem;
  box-shadow: 0px -1px 0px ${COLORS.GREY_DE};

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

const HelperText = styled(Typography)`
  margin-top: 1rem;
  font-size: 0.8125rem;
  line-height: 0.9375rem;
  color: ${COLORS.TEXT_MIDGREY};
`;

export const DrawerFooter = ({ Action, helperText, disabled }) => (
  <StyledFooter disabled={disabled}>
    <Action />
    <HelperText variant="body1">{helperText}</HelperText>
  </StyledFooter>
);

DrawerFooter.propTypes = {
  Action: PropTypes.any.isRequired,
  helperText: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

DrawerFooter.defaultProps = {
  disabled: false,
};

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
    padding-bottom: ${props => (props.footerSpacing ? DrawerFooterHeight : 0)};
  }
`;

/*
 * Drawer that slides out from the right to display actions
 */
export const Drawer = ({ anchor, footerSpacing, children, ...props }) => (
  <StyledDrawer footerSpacing={footerSpacing} anchor={anchor} {...props}>
    <DrawerContent>{children}</DrawerContent>
  </StyledDrawer>
);

Drawer.propTypes = {
  footerSpacing: PropTypes.bool,
  anchor: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Drawer.defaultProps = {
  anchor: 'right',
  footerSpacing: false,
};
