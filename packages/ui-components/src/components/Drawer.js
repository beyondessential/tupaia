/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import MuiDrawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import { Close } from '@material-ui/icons';
import styled from 'styled-components';
import { LightIconButton } from './IconButton';
import * as COLORS from '../../stories/story-utils/theme/colors'; // todo fix colors

export default {
  title: 'Drawer',
};

const DrawerFooterHeight = '125px';

const Header = styled.div`
  display: flex;
  flex-direction: column;
  background: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  height: 250px;
  text-align: center;
  padding: 0 1rem 0.5rem;
`;

const HeaderTray = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  text-transform: uppercase;
  padding: 1rem 0;
`;

const HeaderSubHeading = styled.span`
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1rem;
`;

const HeaderContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const HeaderInner = styled.div`
  display: flex;
  flex-direction: column;
`;

/*
 * Drawer Header
 */
export const DrawerHeader = ({ title, date, onClose }) => (
  <Header>
    <HeaderTray>
      <HeaderSubHeading>Upcoming report</HeaderSubHeading>
      <LightIconButton onClick={onClose}>
        <Close />
      </LightIconButton>
    </HeaderTray>
    <HeaderContent>
      <HeaderInner>
        <Typography variant="h2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h6" gutterBottom>
          {date}
        </Typography>
      </HeaderInner>
    </HeaderContent>
  </Header>
);

DrawerHeader.propTypes = {
  title: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

const StyledFooter = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  background: '#F9F9F9';
  height: ${DrawerFooterHeight};
  text-align: center;
  padding: 1.5rem;
  box-shadow: 0px -1px 0px ${COLORS.GREY_DE};
`;

const HelperText = styled(Typography)`
  margin-top: 1rem;
  font-size: 0.8125rem;
  line-height: 0.9375rem;
  color: ${COLORS.TEXT_MIDGREY};
`;

/*
 * Drawer  Footer
 */
export const DrawerFooter = ({ Action, helperText }) => (
  <StyledFooter>
    <Action />
    <HelperText variant="body1">{helperText}</HelperText>
  </StyledFooter>
);

DrawerFooter.propTypes = {
  Action: PropTypes.any.isRequired,
  helperText: PropTypes.string.isRequired,
};

const DrawerContent = styled.div`
  flex: 1;
  background: ${COLORS.WHITE};
  overflow: auto;
`;

const drawerWidth = '500px';

export const StyledDrawer = styled(MuiDrawer)`
  .MuiDrawer-paper {
    width: ${drawerWidth};
    padding-bottom: ${DrawerFooterHeight};
  }
`;

/*
 * Drawer that slides out from the right to display actions
 */
export const Drawer = ({ children, ...props }) => (
  <StyledDrawer anchor="right" {...props}>
    <DrawerContent>{children}</DrawerContent>
  </StyledDrawer>
);

Drawer.propTypes = {
  children: PropTypes.node.isRequired,
};
