/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';
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
} from '@tupaia/ui-components';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Typography from '@material-ui/core/Typography';
import { FlexSpaceBetween } from '../Layout';
import { connectApi } from '../../api';
import * as COLORS from '../../constants/colors';

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

const LoadingContainer = styled.div`
  position: relative;
`;

const LoadingScreen = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${COLORS.LIGHTGREY};
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 3px;
  z-index: 10;
`;

const Loader = styled(CircularProgress)`
  margin-bottom: 1rem;
`;

const LoadingHeading = styled(Typography)`
  margin-bottom: 0.5rem;
`;

const LoadingText = styled(Typography)`
  margin-bottom: 0.5rem;
  color: ${props => props.theme.palette.text.secondary};
`;

export const ModalLoader = ({ isLoading, heading, text, children }) => {
  if (isLoading) {
    return (
      <LoadingContainer>
        {children}
        <LoadingScreen>
          <Loader />
          <LoadingHeading variant="h5">{heading}</LoadingHeading>
          <LoadingText variant="body2">{text}</LoadingText>
        </LoadingScreen>
      </LoadingContainer>
    );
  }

  return children;
};

ModalLoader.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  children: PropTypes.any.isRequired,
  heading: PropTypes.string,
  text: PropTypes.string,
};

ModalLoader.defaultProps = {
  heading: 'Saving Data',
  text: 'Please do not refresh browser or close this page',
};

const CreateOutbreakForm = ({ isLoading }) => {
  return (
    <ModalLoader isLoading={isLoading}>
      <Content>
        <Fields>
          <Select label="Outbreak diagnosis" id="diagnosis" options={options} />
          <DatePicker name="outbreak-date" label="Confirmed Outbreak Date" />
        </Fields>
        <TextField name="textArea" placeholder="Add a note" multiline rows="4" />
      </Content>
    </ModalLoader>
  );
};

CreateOutbreakForm.propTypes = {
  isLoading: PropTypes.bool,
};

CreateOutbreakForm.defaultProps = {
  isLoading: false,
};

const TickIcon = styled(CheckCircle)`
  font-size: 2rem;
  margin-bottom: 0.3rem;
  color: ${props => props.theme.palette.success.main};
`;

const CreateOutbreakSuccess = () => {
  return (
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
};

const ConfirmButtons = ({ handleClose, handleConfirm, disabled }) => {
  return (
    <>
      <OutlinedButton onClick={handleClose} disabled={disabled}>
        Cancel
      </OutlinedButton>
      <Button onClick={handleConfirm} disabled={disabled}>
        Confirm
      </Button>
    </>
  );
};

ConfirmButtons.propTypes = {
  handleClose: PropTypes.func,
  handleConfirm: PropTypes.func,
  disabled: PropTypes.bool,
};

ConfirmButtons.defaultProps = {
  handleClose: null,
  handleConfirm: null,
  disabled: false,
};

const NavButtons = () => {
  return (
    <>
      <OutlinedButton to="/alerts" component={RouterLink}>
        Stay on Alerts
      </OutlinedButton>
      <Button to="/alerts/outbreaks" component={RouterLink}>
        Go to Outbreaks
      </Button>
    </>
  );
};

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

  const Body = {
    [STATUS.INITIAL]: <CreateOutbreakForm />,
    [STATUS.LOADING]: <CreateOutbreakForm isLoading />,
    [STATUS.SUCCESS]: <CreateOutbreakSuccess />,
  };

  const Actions = {
    [STATUS.INITIAL]: <ConfirmButtons handleClose={handleClose} handleConfirm={handleConfirm} />,
    [STATUS.LOADING]: <ConfirmButtons disabled />,
    [STATUS.SUCCESS]: <NavButtons />,
  };

  return (
    <Dialog onClose={handleClose} open={isOpen}>
      <DialogHeader onClose={handleClose} title="Confirm Outbreak" />
      {Body[status]}
      <DialogFooter>{Actions[status]}</DialogFooter>
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
