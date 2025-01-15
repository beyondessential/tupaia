import React, { ReactNode } from 'react';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { SmallAlert } from '../Alert';
import { GreyOutlinedButton } from '../Button';

const Container = styled.div`
  position: relative;
`;

const LoadingScreen = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f9f9f9;
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 3px;
  z-index: 10;
`;

const Loader = styled(CircularProgress)`
  margin-bottom: 1rem;
`;

const LoadingHeading = styled(Typography)`
  margin-bottom: 0.5rem;
`;

const LoadingText = styled(Typography)`
  margin-bottom: 0.5rem;
  color: ${props => props.theme.palette.text.secondary};
`;

const ErrorText = styled(Typography)`
  margin-bottom: 1rem;
`;

const ErrorAlert = styled(SmallAlert)`
  position: absolute;
  top: 30%;
  width: 90%;
  font-weight: 500;
  border: 1px solid rgba(209, 51, 51, 0.2);
  justify-content: center;
`;

interface ErrorScreenProps {
  onReset: () => void;
  errorMessage: string;
}

const ErrorScreen = ({ onReset, errorMessage }: ErrorScreenProps) => {
  return (
    <>
      <ErrorText>{errorMessage}</ErrorText>
      <GreyOutlinedButton onClick={onReset}>Start over</GreyOutlinedButton>
    </>
  );
};

interface WrapperProps {
  children: ReactNode;
  loadingContainerChildren: ReactNode;
}

const Wrapper = ({ children: loadingScreenChildren, loadingContainerChildren }: WrapperProps) => (
  <Container className="loading-container">
    {loadingContainerChildren}
    <LoadingScreen className="loading-screen">{loadingScreenChildren}</LoadingScreen>
  </Container>
);

/**
 * Adds a loader around the children
 */
interface LoadingContainerProps {
  isLoading: boolean;
  heading?: string;
  text?: string;
  children: ReactNode;
  errorMessage?: string;
  onReset?: () => void;
}

export const LoadingContainer = ({
  isLoading,
  heading = 'Saving Data',
  text = 'Please do not refresh the browser or close this page',
  children = null,
  errorMessage,
  onReset,
}: LoadingContainerProps) => {
  if (onReset && errorMessage) {
    return (
      <Wrapper loadingContainerChildren={children}>
        <ErrorScreen onReset={onReset} errorMessage={errorMessage} />
      </Wrapper>
    );
  }

  if (errorMessage) {
    return (
      <Wrapper loadingContainerChildren={children}>
        <ErrorAlert severity="error" variant="standard">
          {errorMessage}
        </ErrorAlert>
      </Wrapper>
    );
  }

  if (isLoading) {
    return (
      <Wrapper loadingContainerChildren={children}>
        <Loader />
        <LoadingHeading variant="h5">{heading}</LoadingHeading>
        <LoadingText variant="body2">{text}</LoadingText>
      </Wrapper>
    );
  }

  return <>{children}</>;
};
