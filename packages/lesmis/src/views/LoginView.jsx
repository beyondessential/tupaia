import React from 'react';
import MuiCard from '@material-ui/core/Card';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { LoginForm, FlexCenter, FlexColumn, FormBackButton, I18n } from '../components';
import { LocaleLink } from '../components/LocaleLinks';

const Container = styled(FlexColumn)`
  padding-top: 3rem;
  min-height: 70vh;
`;

const StyledCard = styled(MuiCard)`
  width: 28rem;
  padding: 2.5rem 3.5rem 3rem 3rem;
  margin: 0 auto 2rem;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
  ${props => props.theme.breakpoints.down('sm')} {
    box-shadow: none;
  }
`;

const StyledImg = styled.img`
  height: 6.5rem;
  width: auto;
  margin-bottom: 2rem;
`;

const Text = styled(Typography)`
  font-size: 0.875rem;
  line-height: 1rem;
  margin-right: 5px;
`;

const StyledLocaleLink = styled(LocaleLink)`
  font-size: 0.875rem;
  line-height: 1rem;
  text-decoration: none;
`;

export const LoginView = () => {
  return (
    <Container>
      <FormBackButton />
      <StyledImg src="/lesmis-login-logo.svg" alt="LESMIS logo" />
      <StyledCard>
        <LoginForm />
      </StyledCard>
      <FlexCenter mb={4}>
        <Text color="textSecondary">
          <I18n t="login.dontHaveAccess" />
        </Text>
        <StyledLocaleLink to="/register" color="primary">
          <I18n t="login.registerHere" />
        </StyledLocaleLink>
      </FlexCenter>
    </Container>
  );
};
