import React from 'react';
import styled from 'styled-components';
import MuiCard from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import { RegisterForm, FlexCenter, FlexColumn, FormBackButton, I18n } from '../components';
import { LocaleLink } from '../components/LocaleLinks';

const Container = styled(FlexColumn)`
  padding-top: 2rem;
  padding-bottom: 2rem;
  min-height: 90vh;
`;

const StyledCard = styled(MuiCard)`
  width: 50rem;
  max-width: 100%;
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

export const RegisterView = () => (
  <Container>
    <FormBackButton />
    <StyledImg src="/lesmis-login-logo.svg" alt="LESMIS logo" />
    <StyledCard>
      <RegisterForm />
    </StyledCard>
    <FlexCenter mb={4}>
      <Text color="textSecondary">
        <I18n t="register.forAnAccount" />
      </Text>
      <StyledLocaleLink to="/login" color="primary">
        Log in
      </StyledLocaleLink>
    </FlexCenter>
  </Container>
);
