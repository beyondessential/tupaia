/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Button, Modal } from '../../components';

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 1.3rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    flex-direction: row;
    justify-content: center;
  }
`;

const ModalButton = styled(Button)`
  ${({ theme }) => theme.breakpoints.down('xs')} {
    & + & {
      margin: 1rem 0 0 0;
    }
  }
`;

export const CancelSurveyModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  return (
    <Modal open={open} onClose={onClose} title="Survey in progress">
      <Typography align="center">
        If you exit, you will lose the progress you've made on the current survey
      </Typography>
      <ButtonWrapper>
        <ModalButton variant="outlined" to="../../">
          Exit survey
        </ModalButton>
        <ModalButton onClick={onClose}>Continue survey</ModalButton>
      </ButtonWrapper>
    </Modal>
  );
};
