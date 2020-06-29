/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Container, CreateOutbreakModal } from '../components';

export const Sandbox = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(true);

  return (
    <Container>
      <CreateOutbreakModal isOpen={isModalOpen} handleClose={() => setIsModalOpen(false)} />
    </Container>
  );
};
