import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import MuiCard from '@material-ui/core/Card';
import styled from 'styled-components';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { LoginForm } from '../containers';
import { checkIsLoggedIn, getHomeUrl } from '../store';

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

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
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

export const LoginViewComponent = ({ isLoggedIn, homeUrl }) => {
  if (isLoggedIn) {
    return <Redirect to={homeUrl} />;
  }

  return (
    <Main>
      <Container>
        <StyledImg src="/psss-logo.svg" alt="psss-logo" />
        <StyledCard>
          <LoginForm />
        </StyledCard>
        <Wrapper>
          <StyledHelperText>Don&apos;t have access?</StyledHelperText>
          <StyledLink href={requestAnAccountUrl}>Request an account</StyledLink>
        </Wrapper>
      </Container>
    </Main>
  );
};

LoginViewComponent.propTypes = {
  isLoggedIn: PropTypes.bool,
  homeUrl: PropTypes.string.isRequired,
};

LoginViewComponent.defaultProps = {
  isLoggedIn: false,
};

const mapStateToProps = state => ({
  isLoggedIn: checkIsLoggedIn(state),
  homeUrl: getHomeUrl(state),
});

export const LoginView = connect(mapStateToProps)(LoginViewComponent);
