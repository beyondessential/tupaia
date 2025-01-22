import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link as RouterLink, useParams } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { Modal, ModalCenteredContent } from '@tupaia/ui-components';
import { DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM, MODAL_STATUS } from '../../constants';
import { useVisualisationContext, useVizConfigContext } from '../../context';
import { useSaveDashboardVisualisation, useSaveMapOverlayVisualisation } from '../../api';
import { useVizBuilderBasePath } from '../../utils';

const Heading = styled(Typography).attrs({
  variant: 'h3',
})`
  font-weight: ${props => props.theme.typography.fontWeightMedium};
  font-size: ${props => props.theme.typography.body1.fontSize};
  margin-bottom: 0.5rem;
`;

export const SaveVisualisationModal = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState(MODAL_STATUS.INITIAL);
  // eslint-disable-next-line no-unused-vars
  const [_, { setVisualisationValue }] = useVizConfigContext();
  const { visualisation } = useVisualisationContext();

  const basePath = useVizBuilderBasePath();
  const { dashboardItemOrMapOverlay } = useParams();

  const useSaveViz = () => {
    if (dashboardItemOrMapOverlay === DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM.DASHBOARD_ITEM) {
      return useSaveDashboardVisualisation(visualisation);
    }
    if (dashboardItemOrMapOverlay === DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM.MAP_OVERLAY) {
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

  let backLink = basePath;
  if (dashboardItemOrMapOverlay === DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM.DASHBOARD_ITEM) {
    backLink = backLink.concat('/visualisations');
  } else if (dashboardItemOrMapOverlay === DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM.MAP_OVERLAY) {
    backLink = backLink.concat('/visualisations/map-overlays');
  }

  if (status === MODAL_STATUS.SUCCESS) {
    const buttons = [
      {
        text: 'Stay on this page',
        onClick: handleClose,
        variant: 'outlined',
      },
      {
        text: 'Go back to Admin Panel',
        to: backLink,
        component: RouterLink,
      },
    ];
    return (
      <Modal onClose={handleClose} isOpen={isOpen} title="Save visualisation" buttons={buttons}>
        <ModalCenteredContent>
          <Heading>Visualisation saved successfully</Heading>
          <Typography>Visualisation has been saved</Typography>
        </ModalCenteredContent>
      </Modal>
    );
  }

  return (
    <Modal
      onClose={handleClose}
      isOpen={isOpen}
      title="Save visualisation"
      isLoading={status === MODAL_STATUS.LOADING}
      error={error}
      buttons={[
        {
          text: 'Cancel',
          onClick: handleClose,
          variant: 'outlined',
          disabled: status === MODAL_STATUS.LOADING,
        },
        {
          text: 'Save',
          onClick: handleSave,
          color: 'primary',
          disabled: status === MODAL_STATUS.LOADING,
        },
      ]}
    >
      <ModalCenteredContent>
        <Heading>Are you sure you want to save this visualisation?</Heading>
        <Typography>
          {visualisation.id
            ? 'The previous version of this visualisation will be overwritten'
            : `Visualisation will be created`}
        </Typography>
      </ModalCenteredContent>
    </Modal>
  );
};

SaveVisualisationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
