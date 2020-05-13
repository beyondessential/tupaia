/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import MuiCard from '@material-ui/core/Card';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { LoginForm } from '../components';
import * as COLORS from '../theme/colors';
import { checkIsLoggedIn } from '../store';

export const Main = styled.main`
  background-color: ${COLORS.BLUE};
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 10%;
`;

export const StyledCard = styled(MuiCard)`
  max-width: 400px;
  width: 400px;
  padding: 2rem;
  margin: 0 auto;
`;

export const LoginViewComponent = ({ isLoggedIn }) => {
  if (isLoggedIn) {
    return <Redirect to="/" />;
  }

  return (
    <Main>
      <StyledCard>
        <LoginForm />
      </StyledCard>
    </Main>
  );
};

LoginViewComponent.propTypes = {
  isLoggedIn: PropTypes.bool,
};

LoginViewComponent.defaultProps = {
  isLoggedIn: false,
};

const mapStateToProps = state => ({
  isLoggedIn: checkIsLoggedIn(state),
});

export const LoginView = connect(mapStateToProps)(LoginViewComponent);
