/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  Dialog,
  ModalContentProvider,
  ModalFooter,
  ModalHeader,
} from '@tupaia/ui-components';
import { DashboardItemMetadataForm } from '../DashboardItem';
import { MapOverlayMetadataForm } from '../MapOverlay';
import { DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM } from '../../constants';

export const EditModal = () => {
  const { dashboardItemOrMapOverlay } = useParams();

  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  let MetadataForm = null;
  if (dashboardItemOrMapOverlay === DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM.DASHBOARD_ITEM) {
    MetadataForm = DashboardItemMetadataForm;
  } else if (dashboardItemOrMapOverlay === DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM.MAP_OVERLAY) {
    MetadataForm = MapOverlayMetadataForm;
  } else {
    throw new Error(`Unknown viz type ${dashboardItemOrMapOverlay}`);
  }

  return (
    <>
      <Dialog onClose={handleClose} open={isOpen}>
        <MetadataForm
          onSubmit={handleClose}
          Header={() => <ModalHeader onClose={handleClose} title="Edit Details" />}
          Body={ModalContentProvider}
          Footer={() => (
            <ModalFooter>
              <Button onClick={handleClose} variant="outlined">
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </ModalFooter>
          )}
        />
      </Dialog>
      <Button onClick={handleOpen} variant="outlined">
        Edit
      </Button>
    </>
  );
};
