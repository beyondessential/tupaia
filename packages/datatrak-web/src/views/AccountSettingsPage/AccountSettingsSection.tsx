/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Paper, Typography } from '@material-ui/core';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { AccountSettingsColumn } from './AccountSettingsColumn';

const Wrapper = styled(Paper).attrs({
  elevation: 0,
  component: 'section',
})`
  column-gap: 2rem;
  display: block flex;
  flex-direction: column;
  margin-block-start: 1.5rem;
  padding-block: 1rem;
  padding-inline: 1.25rem;
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
  margin-bottom: 0.6rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
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
