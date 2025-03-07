import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { DialogContent } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import HelpOutline from '@material-ui/icons/HelpOutline';
import { TooltipIconButton } from '../TooltipIconButton';
import { SmallAlert } from '../Alert';

const LIGHT_RED = '#F76853';
const RED = '#F76853';
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
  font-size: ${props => props.theme.typography.body1.fontSize};
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
    color: ${LIGHT_RED};
    margin-block-end: 0.3rem;
  }
  .tooltip-icon:hover {
    svg {
      fill: ${RED};
    }
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

export interface ModalContentProviderProps {
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
  children: ReactNode;
}

export const ModalContentProvider = ({ isLoading, error, children }: ModalContentProviderProps) => {
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
    <Content>
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
