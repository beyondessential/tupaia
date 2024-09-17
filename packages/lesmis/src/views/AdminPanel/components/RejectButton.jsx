/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { ColumnActionButton, DataChangeAction, useApiContext } from '@tupaia/admin-panel';
import { Modal, ModalCenteredContent } from '@tupaia/ui-components';
import { Delete } from '@material-ui/icons';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useRejectSurveyResponseStatus } from '../api';

const ConfirmModalHeading = styled(Typography).attrs({
  variant: 'h3',
})`
  font-weight: ${props => props.theme.typography.fontWeightMedium};
  font-size: ${props => props.theme.typography.body1.fontSize};
  margin-bottom: 0.5rem;
`;

const RejectConfirmModal = ({ isOpen, onClose, onConfirm, error, translate, isLoading }) => (
  <Modal
    onClose={onClose}
    isOpen={isOpen}
    isLoading={isLoading}
    error={error}
    buttons={[
      {
        text: translate('admin.cancel'),
        onClick: onClose,
        disabled: isLoading,
        variant: 'outlined',
      },
      {
        text: translate('admin.yesReject'),
        onClick: onConfirm,
        disabled: isLoading,
      },
    ]}
    title={translate('admin.rejectSurveyResponse')}
  >
    <ModalCenteredContent>
      <ConfirmModalHeading>
        {translate('admin.areYouSureYouWantToRejectThisSurveyResponse')}
      </ConfirmModalHeading>
      <Typography>
        {translate(
          'admin.rejectingASurveyResponseWillRemoveTheRecordFromThisTabAndPreventTheDataDisplayingInAnyVisualisations',
        )}
      </Typography>
    </ModalCenteredContent>
  </Modal>
);

RejectConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  error: PropTypes.object,
  translate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

RejectConfirmModal.defaultProps = {
  error: null,
};

export const getRejectButton = translate => {
  const RejectButton = ({ row }) => {
    const api = useApiContext();
    const [isOpen, setIsOpen] = useState(false);
    const { mutate, isLoading, error } = useRejectSurveyResponseStatus(api);

    const handleClickReject = ({ onEditBegin, onEditSuccess, onEditError }) => {
      onEditBegin();

      mutate(row.original.id, {
        onSuccess: () => {
          onEditSuccess();
          setIsOpen(false);
        },
        onError: errorMessage => {
          onEditError(errorMessage.message);
          setIsOpen(false);
        },
      });
    };

    return (
      <>
        <ColumnActionButton onClick={() => setIsOpen(true)}>
          {isLoading ? <CircularProgress size={16} color="inherit" /> : <Delete />}
        </ColumnActionButton>
        <DataChangeAction
          render={props => (
            <RejectConfirmModal
              {...props}
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              onConfirm={() => handleClickReject(props)}
              error={error}
              translate={translate}
              isLoading={isLoading}
            />
          )}
        />
      </>
    );
  };

  RejectButton.propTypes = {
    row: PropTypes.object.isRequired,
  };

  return RejectButton;
};
