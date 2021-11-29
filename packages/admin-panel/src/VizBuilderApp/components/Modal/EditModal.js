/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Button, Dialog, DialogFooter, DialogHeader } from '@tupaia/ui-components';
import { DashboardMetadataForm } from '../Dashboard';
import { MapOverlayMetadataForm } from '../MapOverlay';
import { VIZ_TYPE_PARAM } from '../../constants';

export const Body = styled.div`
  padding: 30px 20px;
  background-color: #f9f9f9;
`;

export const EditModal = () => {
  const { vizType } = useParams();

  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  let MetadataForm = null;
  if (vizType === VIZ_TYPE_PARAM.DASHBOARD_ITEM) {
    MetadataForm = DashboardMetadataForm;
  } else if (vizType === VIZ_TYPE_PARAM.MAP_OVERLAY) {
    MetadataForm = MapOverlayMetadataForm;
  } else {
    throw new Error(`Unknown viz type ${vizType}`);
  }

  return (
    <>
      <Dialog onClose={handleClose} open={isOpen}>
        <MetadataForm
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
