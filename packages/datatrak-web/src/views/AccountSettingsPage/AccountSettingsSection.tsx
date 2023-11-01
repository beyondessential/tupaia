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
})`
  padding: 2.5rem;
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1rem;
  margin-bottom: 0.6rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const Column = styled.div`
  width: 30%;
  display: flex;
  flex-direction: column;
  &:first-child {
    width: 30%;
  }
  &:last-child {
    justify-content: flex-end;
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
