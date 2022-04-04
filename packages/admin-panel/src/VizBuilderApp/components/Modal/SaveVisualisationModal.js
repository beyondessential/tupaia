/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link as RouterLink, useParams } from 'react-router-dom';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Typography from '@material-ui/core/Typography';

import {
  Button,
  OutlinedButton,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  ConfirmModal,
} from '@tupaia/ui-components';

import { MODAL_STATUS, VIZ_TYPE_PARAM } from '../../constants';
import { useVizConfig, useVisualisation } from '../../context';
import { useSaveDashboardVisualisation, useSaveMapOverlayVisualisation } from '../../api';

const TickIcon = styled(CheckCircle)`
  font-size: 2.5rem;
  margin-bottom: 0.3rem;
  color: ${props => props.theme.palette.success.main};
`;

const SuccessText = styled(Typography)`
  font-size: 1rem;
  margin-top: 1rem;
`;

export const SaveVisualisationModal = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState(MODAL_STATUS.INITIAL);
  // eslint-disable-next-line no-unused-vars
  const [_, { setVisualisationValue }] = useVizConfig();
  const { visualisation } = useVisualisation();

  const { vizType } = useParams();

  const useSaveViz = () => {
    if (vizType === VIZ_TYPE_PARAM.DASHBOARD_ITEM) {
      return useSaveDashboardVisualisation(visualisation);
    }
    if (vizType === VIZ_TYPE_PARAM.MAP_OVERLAY) {
      return useSaveMapOverlayVisualisation(visualisation);
    }
    throw new Error('Unknown viz type');
  };
  const { mutateAsync: saveVisualisation, error } = useSaveViz();

  const handleSave = useCallback(async () => {
    setStatus(MODAL_STATUS.LOADING);
    try {
      const response = await saveVisualisation();
      setVisualisationValue('id', response.id);
    } catch (e) {
      setStatus(MODAL_STATUS.ERROR);
      return;
    }
    setStatus(MODAL_STATUS.SUCCESS);
  });

  const handleClose = useCallback(() => {
    setStatus(MODAL_STATUS.INITIAL);
    onClose();
  });

  let backLink = '/';
  if (vizType === VIZ_TYPE_PARAM.DASHBOARD_ITEM) {
    backLink = '/dashboard-items';
  } else if (vizType === VIZ_TYPE_PARAM.MAP_OVERLAY) {
    backLink = '/dashboard-items/map-overlays';
  }

  if (status === MODAL_STATUS.SUCCESS) {
    return (
      <Dialog onClose={handleClose} open={isOpen}>
        <DialogHeader onClose={handleClose} title="Save visualisation" />
        <DialogContent>
          <TickIcon />
          <Typography variant="h6" gutterBottom>
            Visualisation saved successfully
          </Typography>
          <SuccessText>Visualisation has been saved</SuccessText>
        </DialogContent>
        <DialogFooter>
          <OutlinedButton onClick={handleClose}>Stay on this page</OutlinedButton>
          <Button to={backLink} component={RouterLink}>
            Go back to Admin Panel
          </Button>
        </DialogFooter>
      </Dialog>
    );
  }

  return (
    <ConfirmModal
      onClose={onClose}
      isOpen={isOpen}
      isLoading={status === MODAL_STATUS.LOADING}
      title="Save visualisation"
      mainText="Are you sure you want to save this visualisation?"
      description={
        visualisation.id
          ? 'The previous version of this visualisation will be overwritten'
          : `Visualisation will be created`
      }
      error={error && error.message}
      actionText="Save"
      loadingText="Saving"
      handleAction={handleSave}
    />
  );
};

SaveVisualisationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
