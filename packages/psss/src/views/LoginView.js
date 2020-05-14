/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import MuiCard from '@material-ui/core/Card';
import styled from 'styled-components';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { LoginForm } from '../components';
import { checkIsLoggedIn } from '../store';

export const Main = styled.main`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 5%;
`;

export const Container = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const StyledCard = styled(MuiCard)`
  width: 450px;
  padding: 40px 50px 50px;
  margin: 0 auto 30px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
`;

const StyledImg = styled.img`
  height: 96px;
  width: auto;
  margin-bottom: 40px;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
`;

const StyledHelperText = styled(Typography)`
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  color: ${props => props.theme.palette.text.secondary};
`;

const StyledLink = styled(MuiLink)`
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  margin-left: 5px;
  color: ${props => props.theme.palette.primary.main};
`;

export const LoginViewComponent = ({ isLoggedIn }) => {
  if (isLoggedIn) {
    return <Redirect to="/" />;
  }

  return (
    <Main>
      <Container>
        <StyledImg src="/psss-logo.svg" alt="psss-logo" />
        <StyledCard>
          <LoginForm />
        </StyledCard>
        <Wrapper>
          <StyledHelperText>Dont have access?</StyledHelperText>
          <StyledLink>Request an account</StyledLink>
        </Wrapper>
      </Container>
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
