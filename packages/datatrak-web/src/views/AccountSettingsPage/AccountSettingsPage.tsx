/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Settings } from '@material-ui/icons';
import { PersonalDetailsSection } from './PersonalDetailsSection';
import { ChangePasswordSection } from './ChangePasswordSection';
import { RequestCountryAccessSection } from './RequestCountryAccessSection';
import { DeleteAccountSection } from './DeleteAccountSection';
import { PageContainer } from '../../components';
import { useIsMobile } from '../../utils';
import { StickyMobileHeader } from '../../layout';
import { useNavigate } from 'react-router';

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
  display: flex;
  align-items: center;
  font-size: 1.5rem;
`;

const MobilePageTitle = styled(Typography).attrs({
  variant: 'h3',
})`
  display: inline;
  vertical-align: middle;
  font-size: 1.25rem;
`;

const SettingsIcon = styled(Settings).attrs({ color: 'primary' })`
  margin-right: 0.4rem;
`;

export const AccountSettingsPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const onBack = () => {
    navigate(-1);
  };
  return (
    <>
      {isMobile && (
        <StickyMobileHeader onBack={onBack}>
          <SettingsIcon />
          <MobilePageTitle>Account settings</MobilePageTitle>
        </StickyMobileHeader>
      )}
      <Wrapper>
        {!isMobile && (
          <PageTitle>
            <SettingsIcon />
            Account settings
          </PageTitle>
        )}
        <PersonalDetailsSection />
        <ChangePasswordSection />
        <RequestCountryAccessSection />
        <DeleteAccountSection />
      </Wrapper>
    </>
  );
};
