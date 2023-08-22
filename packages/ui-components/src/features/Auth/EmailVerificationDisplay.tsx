/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';

export enum STATUS {
  SUCCESS = 'success',
  ERROR = 'error',
}

const MessageText = styled(Typography)<{
  $status?: STATUS | string;
}>`
  color: ${({ theme, $status }) => {
    if ($status === STATUS.SUCCESS) return theme.palette.success.main;
    if ($status === STATUS.ERROR) return theme.palette.error.main;
    return theme.palette.text.primary;
  }};
`;

type Message = {
  status?: STATUS | string;
  text?: string;
};

export const EmailVerificationDisplay = ({ message }: { message?: Message }) => {
  if (!message || !message.text) return null;
  const { status, text } = message;
  return <MessageText $status={status}>{text}</MessageText>;
};
