/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import styled from 'styled-components';
import MuiAppBar from '@material-ui/core/AppBar';
import MuiTabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import { LoginForm } from '../../../LoginForm';
import { SignupForm } from '../../../SignupForm';
import { RequestResetPasswordForm } from '../../../RequestResetPasswordForm';
import { OVERLAY_PADDING } from '../../constants';
import { DARK_BLUE, LIGHTENED_DARK_BLUE, PRIMARY_BLUE } from '../../../../styles';

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const AppBar = styled(MuiAppBar)`
  box-shadow: none;
  background-color: ${DARK_BLUE};
`;

const Tabs = styled(MuiTabs)`
  .MuiTabs-indicator {
    display: none;
  }

  .Mui-selected {
    background-color: ${LIGHTENED_DARK_BLUE};
    border-top: 3px solid ${PRIMARY_BLUE};
  }
`;

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
};

const LoginPanel = styled(TabPanel)`
  margin: 0 64px;
`;

const ContentContainer = styled.div`
  position: relative;
  margin: ${({ margin }) => margin};
  margin-top: 10px;
  background-color: ${LIGHTENED_DARK_BLUE};
  transition: height 0.4 linear;
`;

export const LoginPage = () => {
  const contentMargin = OVERLAY_PADDING.split(' ')
    .map(x => `-${x}`)
    .join(' ');

  const [isRequestingReset, setIsRequestingReset] = React.useState(false);
  const handleCancelReset = React.useCallback(() => setIsRequestingReset(false), []);
  const handleRequestReset = React.useCallback(() => setIsRequestingReset(true), []);

  const [value, setValue] = React.useState(1);
  const handleChange = React.useCallback((_, newValue) => setValue(newValue));
  const handleLogin = React.useCallback(() => setValue(1));

  return (
    <ContentContainer margin={contentMargin}>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Register" {...a11yProps(0)} />
          <Tab label="Log in" {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <div>
        <TabPanel value={value} index={0}>
          <SignupForm handleLogin={handleLogin} />
        </TabPanel>
        <LoginPanel value={value} index={1}>
          {isRequestingReset ? (
            <RequestResetPasswordForm onClickCancel={handleCancelReset} key="reset" />
          ) : (
            <LoginForm onClickResetPassword={handleRequestReset} />
          )}
        </LoginPanel>
      </div>
    </ContentContainer>
  );
};
