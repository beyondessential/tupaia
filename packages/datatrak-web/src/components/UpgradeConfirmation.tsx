/**
 * Upgrade notification dialog is being used in main.tsx outside of the all AppProviders,
 * so it won't work with MuiThemeProvider or other Providers.
 * Please do not use material-ui components or other context in this file.
 */
import React from 'react';
import styled from 'styled-components';
import { confirmable, createConfirmation, type ConfirmDialogProps } from 'react-confirm';

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const Dialog = styled.div`
  background: #f8f9fa;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 350px;
  width: 100%;
  padding: 40px 32px 32px 32px;
  text-align: center;
  font-family: Roboto, Helvetica, Arial, sans-serif;
`;

const Title = styled.h2`
  margin: 0 0 24px 0;
  color: #333333;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
`;

const Description = styled.p`
  margin: 0 0 32px 0;
  color: #6F6F6F;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 400;
`;

const RefreshButton = styled.button`
  background: #4285f4;
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 3px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;

  &:hover {
    background: #3367d6;
  }
`;

const UpdateDialog = ({ show, proceed }: ConfirmDialogProps<{ message: string }, boolean>) => {
  if (!show) return null;

  return (
    <Backdrop>
      <Dialog>
        <Title>App update available</Title>

        <Description>
          A new version of Datatrak is now available. Please refresh to continue using the latest
          features and improvements.
        </Description>

        <RefreshButton onClick={() => proceed(true)}>Refresh app</RefreshButton>
      </Dialog>
    </Backdrop>
  );
};

export const confirm = createConfirmation(confirmable(UpdateDialog));
