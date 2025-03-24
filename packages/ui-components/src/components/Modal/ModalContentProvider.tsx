import React, { ComponentPropsWithoutRef } from 'react';
import styled from 'styled-components';

import { DialogContent } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import HelpOutline from '@material-ui/icons/HelpOutline';

import { SmallAlert } from '../Alert';
import { TooltipIconButton } from '../TooltipIconButton';

const Content = styled(DialogContent)`
  border-block: 1px solid ${props => props.theme.palette.grey[400]};
  display: flex;
  flex-direction: column;
  min-block-size: 13.75rem;
  padding-block: 1.25rem;
  padding-inline: 1.9rem;
  text-align: start;
`;

const ErrorHeading = styled(Typography)`
  font-size: ${props => props.theme.typography.body1.fontSize};
  font-weight: ${props => props.theme.typography.fontWeightMedium};
  margin-block-end: 1.1rem;
`;

const Alert = styled(SmallAlert).attrs({
  severity: 'error',
  variant: 'standard',
})`
  inline-size: 100%;
`;

const AlertWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  & + & {
    margin-block-start: 0.5rem;
  }

  .MuiSvgIcon-root {
    color: ${props => props.theme.palette.error.main};
    margin-block-end: 0.3rem;
  }
  .tooltip-icon:hover svg {
    fill: ${props => props.theme.palette.error.main};
  }
`;

const ErrorsWrapper = styled.div`
  max-width: 25rem;
  margin: 0 auto;
`;

const Error = ({ message, details }: { message: string; details?: string }) => {
  return (
    <AlertWrapper>
      {details && <TooltipIconButton tooltip={details} Icon={HelpOutline} />}
      <Alert>{message}</Alert>
    </AlertWrapper>
  );
};

export interface ModalContentProviderProps extends ComponentPropsWithoutRef<typeof Content> {
  isLoading?: boolean;
  error?: {
    message: string;
    extraFields?: {
      errorDetails?: {
        errors?: {
          message: string;
          extraFields?: {
            details?: string;
          };
        }[];
      };
    };
  };
}

export const ModalContentProvider = ({
  isLoading,
  error,
  children,
  ...props
}: ModalContentProviderProps) => {
  const getHeading = () => {
    if (!error) return null;
    const { extraFields } = error;
    if (
      !extraFields?.errorDetails?.errors?.length ||
      extraFields?.errorDetails?.errors?.length === 1
    )
      return 'The below error has occurred:';
    return 'The below errors have occurred:';
  };

  const heading = getHeading();

  const getErrorsToDisplay = () => {
    if (!error) return [];
    const { message, extraFields } = error;
    if (!extraFields?.errorDetails?.errors?.length) return [{ message }];
    return extraFields.errorDetails.errors;
  };

  const errors = getErrorsToDisplay();
  return (
    <Content {...props}>
      {isLoading && 'Please be patient, this can take some time…'}
      {error?.message && (
        <ErrorsWrapper>
          <ErrorHeading>{heading}</ErrorHeading>
          {errors.map(({ message, extraFields }) => (
            <Error key={message} message={message} details={extraFields?.details} />
          ))}
        </ErrorsWrapper>
      )}
      {/* If loading or error message, don't show children */}
      {!isLoading && !error && children}
    </Content>
  );
};
