import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum EMAIL_VERIFICATION_STATUS {
  SUCCESS = 'success',
  ERROR = 'error',
}

const MessageText = styled(Typography)<{
  $status?: EMAIL_VERIFICATION_STATUS | string;
}>`
  color: ${({ theme, $status }) => {
    if ($status === EMAIL_VERIFICATION_STATUS.SUCCESS) return theme.palette.success.main;
    if ($status === EMAIL_VERIFICATION_STATUS.ERROR) return theme.palette.error.main;
    return theme.palette.text.primary;
  }};
`;

export type Message = {
  status?: EMAIL_VERIFICATION_STATUS | string;
  text?: string;
};

export const EmailVerificationDisplay = ({ message }: { message?: Message | null }) => {
  if (!message || !message.text) return null;
  const { status, text } = message;
  return <MessageText $status={status}>{text}</MessageText>;
};
