/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { Meta } from '@storybook/react';
import styled from 'styled-components';
import { Button } from '@material-ui/core';
import { AuthModalBody, AuthModalButton, Modal } from '../../src/components';

const meta: Meta<typeof Modal> = {
  title: 'components/Modal',
  component: Modal,
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    theme: 'dark',
  },
};

export default meta;

export const Simple = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        Hi, I am a modal
      </Modal>
    </>
  );
};

const ModalBody = styled(AuthModalBody)`
  width: 42rem;
`;

export const AuthModal = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalBody title="Login" subtitle="Login here">
          Hi, I am an auth modal
          <AuthModalButton>Login</AuthModalButton>
        </ModalBody>
      </Modal>
    </>
  );
};
