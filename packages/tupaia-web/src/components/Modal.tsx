/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Button } from '@tupaia/ui-components';
import BaseModal from '@material-ui/core/Modal';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import styled from 'styled-components';

const Container = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 660px;
  max-width: 100%;
  transform: translate(-50%, -50%);
  border-radius: 5px;
  background: #2e2f33;
  padding: 2rem 2rem 7rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  .MuiIconButton-root {
    position: absolute;
    top: 2px;
    right: 4px;
    color: white;

    svg {
      font-size: 2rem;
    }
  }
`;
export const Modal = ({ onClose, open, children }) => {
  return (
    <BaseModal onClose={onClose} open={open}>
      <Container>
        <IconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
        {children}
      </Container>
    </BaseModal>
  );
};

export const ModalButton = styled(Button)`
  width: 100%;
  margin-top: 2rem;
  margin-bottom: 1.2rem;
  text-transform: none;
`;
