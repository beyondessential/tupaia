/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';
import MuiCard from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import { FlexCenter } from '@tupaia/ui-components';
import MuiLink from '@material-ui/core/Link';
import { getIsUserAuthenticated } from '../authentication';
import { LoginForm } from '../authentication/LoginForm';
import { useI18n } from '../../../utils';

const Main = styled.main`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 5%;
`;

const Container = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StyledCard = styled(MuiCard)`
  width: 28rem;
  padding: 2.5rem 3.5rem 3rem 3rem;
  margin: 0 auto 2rem;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
`;

const StyledImg = styled.img`
  height: 6rem;
  width: auto;
  margin-bottom: 2.5rem;
`;

const StyledHelperText = styled(Typography)`
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1rem;
  color: ${props => props.theme.palette.text.secondary};
`;

const StyledLink = styled(MuiLink)`
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1rem;
  margin-left: 0.3rem;
  color: ${props => props.theme.palette.primary.main};
`;

const requestAnAccountUrl = 'https://info.tupaia.org/contact';

const Logo = () => <StyledImg src="/admin-panel-logo.svg" alt="psss-logo" />;

const LoginPageComponent = ({ isLoggedIn, redirectTo, LogoComponent }) => {
  if (isLoggedIn) {
    return <Redirect to={redirectTo} />;
  }
  const { translate } = useI18n();

  return (
    <Main>
      <Container>
        <LogoComponent />
        <StyledCard>
          <LoginForm />
        </StyledCard>
        <FlexCenter mb={4}>
          <StyledHelperText>{translate('login.dontHaveAccess')}</StyledHelperText>
          <StyledLink href={requestAnAccountUrl}>{translate('login.requestAnAccount')}</StyledLink>
        </FlexCenter>
      </Container>
    </Main>
  );
};

LoginPageComponent.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  redirectTo: PropTypes.string,
  LogoComponent: PropTypes.element,
};

LoginPageComponent.defaultProps = {
  redirectTo: '/',
  LogoComponent: Logo,
};

const mapStateToProps = state => ({
  isLoggedIn: getIsUserAuthenticated(state),
});

export const LoginPage = connect(mapStateToProps)(LoginPageComponent);
