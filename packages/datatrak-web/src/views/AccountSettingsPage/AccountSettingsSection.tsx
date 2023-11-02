/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Paper, Typography } from '@material-ui/core';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Button } from '../../components';

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
  margin-bottom: 0.6rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 1rem;
  &:not(:last-child) {
    padding-right: 2rem;
  }
  &:first-child {
    margin-bottom: 1.9rem;
  }
  &:last-child {
    margin-bottom: 0;
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    width: 28.5%;
    margin-bottom: 0;
    &:first-child {
      width: 43%;
      margin-bottom: 0;
      p {
        max-width: 22rem;
      }
    }
    &:last-child {
      justify-content: flex-end;
    }
  }
`;

interface AccountSettingsSectionProps {
  title?: ReactNode;
  description?: string;
  leftColumn?: ReactNode;
  centerColumn?: ReactNode;
  rightColumn?: ReactNode;
  button?: {
    label: string;
    onClick: () => void;
    tooltip?: string;
    disabled?: boolean;
  };
}

export const AccountSettingsSection = ({
  title,
  description,
  leftColumn,
  centerColumn,
  rightColumn,
  button,
}: AccountSettingsSectionProps) => {
  return (
    <Wrapper>
      <Column>
        <Title>{title}</Title>
        <Typography color="textSecondary">{description}</Typography>
        {leftColumn}
      </Column>
      <Column>{centerColumn}</Column>
      <Column>
        {rightColumn}
        {button && (
          <Button
            onClick={button.onClick}
            disabled={button.disabled}
            tooltip={button.tooltip}
            fullWidth
          >
            {button.label}
          </Button>
        )}
      </Column>
    </Wrapper>
  );
};
