/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Dialog, DialogFooter, DialogHeader } from '@tupaia/ui-components';
import { DashboardMetadataForm } from '../Dashboard/DashboardMetadataForm';

export const Body = styled.div`
  padding: 30px 20px;
  background-color: #f9f9f9;
`;

export const EditModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      <Dialog onClose={handleClose} open={isOpen}>
        <DashboardMetadataForm
          onSubmit={handleClose}
          Header={() => <DialogHeader onClose={handleClose} title="Edit Details" />}
          Body={Body}
          Footer={() => (
            <DialogFooter>
              <Button onClick={handleClose} variant="outlined">
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          )}
        />
      </Dialog>
      <Button onClick={handleOpen} variant="outlined">
        Edit
      </Button>
    </>
  );
};
