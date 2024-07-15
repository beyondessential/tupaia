/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { DialogContent } from '@material-ui/core';
import { SmallAlert } from '../Alert';

const Content = styled(DialogContent)`
  text-align: left;
  min-height: 220px;
  border-color: ${props => props.theme.palette.grey['400']};
  border-style: solid;
  border-width: 1px 0;
  padding-block: 1.25rem;
  padding-inline: 1.9rem;
  display: flex;
  flex-direction: column;
`;

const ErrorHeading = styled(Typography)`
  margin-bottom: 1.1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

interface ModalContentProviderProps {
  isLoading?: boolean;
  errorMessage?: string;
  children: ReactNode;
}

export const ModalContentProvider = ({
  isLoading,
  errorMessage,
  children,
}: ModalContentProviderProps) => {
  return (
    <Content>
      {isLoading && 'Please be patient, this can take some time...'}
      {!!errorMessage && (
        <>
          <ErrorHeading>An error has occurred</ErrorHeading>
          <SmallAlert severity="error" variant="standard">
            {errorMessage}
          </SmallAlert>
        </>
      )}
      {/* If loading or error message, don't show children */}
      {!isLoading && !errorMessage && children}
    </Content>
  );
};
