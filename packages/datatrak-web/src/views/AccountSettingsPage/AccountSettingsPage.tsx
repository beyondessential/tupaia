import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Settings } from '@material-ui/icons';
import { PersonalDetailsSection } from './PersonalDetailsSection';
import { ChangePasswordSection } from './ChangePasswordSection';
import { RequestCountryAccessSection } from './RequestCountryAccessSection';
import { DeleteAccountSection } from './DeleteAccountSection';
import { PageContainer } from '../../components';

const Wrapper = styled(PageContainer)`
  padding: 1.5rem;
  width: 100%;
  max-width: 89rem;
  margin: 0 auto;
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 1.2rem 2.8rem 2.3rem;
  }
`;

const PageTitle = styled(Typography).attrs({
  variant: 'h1',
})`
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  .MuiSvgIcon-root {
    margin-right: 0.5rem;
  }
  ${({ theme }) => theme.breakpoints.up('md')} {
    font-size: 1.5rem;
  }
`;

export const AccountSettingsPage = () => {
  return (
    <Wrapper>
      <PageTitle>
        <Settings color="primary" />
        Account settings
      </PageTitle>
      <PersonalDetailsSection />
      <ChangePasswordSection />
      <RequestCountryAccessSection />
      <DeleteAccountSection />
    </Wrapper>
  );
};
