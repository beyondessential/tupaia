/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import MuiBox from '@material-ui/core/Box';
import { ConfirmDeleteModal, WarningButton } from '../src/components';

export default {
  title: 'ConfirmDeleteModal',
  component: ConfirmDeleteModal,
};

export const Simple = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MuiBox p={3}>
      <ConfirmDeleteModal
        isOpen={isOpen}
        message="Are you sure you want to delete this?"
        onCancel={() => {
          setIsOpen(false);
        }}
        onConfirm={() => {
          setIsOpen(false);
        }}
      />
      <WarningButton
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Delete this item
      </WarningButton>
    </MuiBox>
  );
};
