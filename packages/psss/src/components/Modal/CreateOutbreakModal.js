/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  OutlinedButton,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  TextField,
  DatePicker,
  Select,
  LoadingContainer,
} from '@tupaia/ui-components';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Typography from '@material-ui/core/Typography';
import { FlexSpaceBetween } from '../Layout';
import { connectApi } from '../../api';

const Content = styled(DialogContent)`
  text-align: left;
`;

const Fields = styled(FlexSpaceBetween)`
  > div {
    &:first-child {
      margin-right: 0.6rem;
    }

    &:last-child {
      margin-left: 0.6rem;
    }
  }
`;

// Todo get options from data??
const options = [
  { label: 'Acute Fever and Rash (AFR)', value: 'afr' },
  { label: 'Diarrhoea (DIA)', value: 'dia' },
  { label: 'Influenza-like Illness (ILI)', value: 'ili' },
  { label: 'Prolonged Fever (AFR)', value: 'pf' },
  { label: 'Dengue-like Illness (DIL)', value: 'dil' },
];

const TickIcon = styled(CheckCircle)`
  font-size: 2rem;
  margin-bottom: 0.3rem;
  color: ${props => props.theme.palette.success.main};
`;

const CreateOutbreakSuccess = () => (
  <DialogContent>
    <TickIcon />
    <Typography variant="h6" gutterBottom>
      Outbreak successfully confirmed
    </Typography>
    <Typography gutterBottom>
      Please note this information has been moved to the outbreak tab.
    </Typography>
  </DialogContent>
);

const NavButtons = () => (
  <>
    <OutlinedButton to="/alerts" component={RouterLink}>
      Stay on Alerts
    </OutlinedButton>
    <Button to="/alerts/outbreaks" component={RouterLink}>
      Go to Outbreaks
    </Button>
  </>
);

const STATUS = {
  INITIAL: 'initial',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};

export const CreateOutbreakModalComponent = ({ isOpen, handleClose, createOutbreak }) => {
  const [status, setStatus] = useState(STATUS.INITIAL);

  const handleConfirm = async () => {
    setStatus(STATUS.LOADING);
    await createOutbreak();
    setStatus(STATUS.SUCCESS);
  };

  return (
    <Dialog onClose={handleClose} open={isOpen}>
      <DialogHeader onClose={handleClose} title="Confirm Outbreak" />
      {status === STATUS.SUCCESS ? (
        <CreateOutbreakSuccess />
      ) : (
        <LoadingContainer isLoading={status === STATUS.LOADING}>
          <Content>
            <Fields>
              <Select
                id="outbreak-diagnosis"
                label="Outbreak diagnosis"
                options={options}
              />
              <DatePicker
                id="outbreak-date"
                name="outbreak-date"
                label="Confirmed Outbreak Date"
              />
            </Fields>
            <TextField
              id="outbreak-note"
              name="note"
              placeholder="Add a note"
              multiline
              rows="4"
            />
          </Content>
        </LoadingContainer>
      )}
      <DialogFooter>
        {status === STATUS.SUCCESS ? (
          <NavButtons />
        ) : (
          <>
            <OutlinedButton onClick={handleClose} disabled={status === STATUS.LOADING}>
              Cancel
            </OutlinedButton>
            <Button
              onClick={handleConfirm}
              isLoading={status === STATUS.LOADING}
              loadingText="Confirming"
            >
              Confirm
            </Button>
          </>
        )}
      </DialogFooter>
    </Dialog>
  );
};

CreateOutbreakModalComponent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  createOutbreak: PropTypes.func.isRequired,
};

const mapApiToProps = api => ({
  createOutbreak: () => api.post(),
});

export const CreateOutbreakModal = connectApi(mapApiToProps)(CreateOutbreakModalComponent);
