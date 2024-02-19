/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Paper, Typography } from '@material-ui/core';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { AccountSettingsColumn } from './AccountSettingsColumn';

const Wrapper = styled(Paper).attrs({
  elevation: 0,
  component: 'section',
})`
  padding: 0.8rem;
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.breakpoints.up('md')} {
    flex-direction: row;
    justify-content: space-between;
    padding: 2.5rem;
  }
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  margin-block-end: 0.6rem;
`;

interface AccountSettingsSectionProps {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

export const AccountSettingsSection = ({
  title,
  description,
  children,
}: AccountSettingsSectionProps) => {
  return (
    <Wrapper>
      <AccountSettingsColumn>
        <Title>{title}</Title>
        {description}
      </AccountSettingsColumn>
      {children}
    </Wrapper>
  );
};
