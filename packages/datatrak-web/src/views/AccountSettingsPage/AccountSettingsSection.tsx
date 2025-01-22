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
    gap: 2.5rem;
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
        <Typography color="textSecondary">{description}</Typography>
      </AccountSettingsColumn>
      {children}
    </Wrapper>
  );
};
