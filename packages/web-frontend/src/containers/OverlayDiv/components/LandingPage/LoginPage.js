/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import MuiAppBar from '@material-ui/core/AppBar';
import MuiTabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { LoginForm } from '../../../LoginForm';
import { SignupForm } from '../../../SignupForm';
import { RequestResetPasswordForm } from '../../../RequestResetPasswordForm';
import { AUTH_VIEW_STATES, OVERLAY_PADDING } from '../../constants';
import { DARK_BLUE, LIGHTENED_DARK_BLUE, PRIMARY_BLUE } from '../../../../styles';
import { setAuthViewState } from '../../../../actions';

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

const LoginView = ({ authViewState, updateAuthViewState }) => {
  const contentMargin = OVERLAY_PADDING.split(' ')
    .map(x => `-${x}`)
    .join(' ');

  const [isRequestingReset, setIsRequestingReset] = React.useState(false);
  const handleCancelReset = React.useCallback(() => setIsRequestingReset(false), []);
  const handleRequestReset = React.useCallback(() => setIsRequestingReset(true), []);

  const handleChange = (_, newValue) => updateAuthViewState(newValue);
  const handleLogin = () => updateAuthViewState(AUTH_VIEW_STATES.LOGIN);

  return (
    <ContentContainer margin={contentMargin}>
      <AppBar position="static" color="default">
        <Tabs
          value={authViewState}
          onChange={handleChange}
          variant="fullWidth"
          aria-label="Login and register form"
        >
          <Tab label="Register" {...a11yProps(AUTH_VIEW_STATES.REGISTER)} />
          <Tab label="Log in" {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <TabPanel value={authViewState} index={AUTH_VIEW_STATES.REGISTER}>
        <SignupForm handleLogin={handleLogin} />
      </TabPanel>
      <LoginPanel value={authViewState} index={AUTH_VIEW_STATES.LOGIN}>
        {isRequestingReset ? (
          <RequestResetPasswordForm onClickCancel={handleCancelReset} key="reset" />
        ) : (
          <LoginForm onClickResetPassword={handleRequestReset} />
        )}
      </LoginPanel>
    </ContentContainer>
  );
};

LoginView.propTypes = {
  authViewState: PropTypes.oneOf([AUTH_VIEW_STATES.LOGIN, AUTH_VIEW_STATES.REGISTER]).isRequired,
  updateAuthViewState: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    authViewState: state.authentication.authViewState,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateAuthViewState: authViewState => dispatch(setAuthViewState(authViewState)),
  };
};

export const LoginPage = connect(mapStateToProps, mapDispatchToProps)(LoginView);
