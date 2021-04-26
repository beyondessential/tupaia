/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MuiCard from '@material-ui/core/Card';
import styled from 'styled-components';
import MuiLink from '@material-ui/core/Link';
import Dialog from '@material-ui/core/Dialog';
import MuiButton from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { LoginForm } from './LoginForm';

export const Container = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 3.75rem;
  padding-top: 10vh;
`;

export const StyledCard = styled(MuiCard)`
  width: 28rem;
  padding: 2.5rem 3.5rem 3rem 3rem;
  margin: 0 auto 2rem;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
`;

const StyledImg = styled.img`
  height: 8rem;
  width: auto;
  margin-bottom: 2rem;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2.5rem;
`;

const StyledHelperText = styled(Typography)`
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1rem;
  color: ${props => props.theme.palette.text.secondary};
`;

const StyledLink = styled(MuiLink)`
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1rem;
  margin-left: 0.3rem;
  color: ${props => props.theme.palette.primary.main};
`;

const LoginButton = styled(MuiButton)`
  color: white;
  border-color: white;
  padding: 0.5rem 2rem;
  border-radius: 2.5rem;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 0;
  right: 0;
`;

const requestAnAccountUrl = 'https://info.tupaia.org/contact';

export const LoginDialog = ({ buttonText }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <LoginButton onClick={handleClickOpen} variant="outlined">
        {buttonText}
      </LoginButton>
      <Dialog fullScreen open={open} onClose={handleClose}>
        <CloseButton color="inherit" onClick={handleClose} aria-label="close">
          <CloseIcon />
        </CloseButton>
        <Container>
          <StyledImg src="/lesmis-login-logo.svg" alt="lesmis-logo" />
          <StyledCard>
            <LoginForm />
          </StyledCard>
          <Wrapper>
            <StyledHelperText>Don&apos;t have access?</StyledHelperText>
            <StyledLink href={requestAnAccountUrl}>Request an account</StyledLink>
          </Wrapper>
        </Container>
      </Dialog>
    </>
  );
};

LoginDialog.propTypes = {
  buttonText: PropTypes.string.isRequired,
};
