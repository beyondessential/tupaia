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
import { useForm, Controller } from 'react-hook-form';
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
  font-size: 2.5rem;
  margin-bottom: 0.3rem;
  color: ${props => props.theme.palette.success.main};
`;

const SuccessText = styled(Typography)`
  font-size: 1rem;
  margin-top: 1rem;
`;

const STATUS = {
  INITIAL: 'initial',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};

export const CreateOutbreakModalComponent = ({ isOpen, handleClose, createOutbreak }) => {
  const { handleSubmit, register, errors, control } = useForm();
  const [status, setStatus] = useState(STATUS.INITIAL);

  const handleConfirm = async fields => {
    setStatus(STATUS.LOADING);
    await createOutbreak(fields);
    setStatus(STATUS.SUCCESS);
  };

  if (status === STATUS.SUCCESS) {
    return (
      <Dialog onClose={handleClose} open={isOpen}>
        <DialogHeader onClose={handleClose} title="Confirm Outbreak" />
        <DialogContent>
          <TickIcon />
          <Typography variant="h6" gutterBottom>
            Outbreak successfully confirmed
          </Typography>
          <SuccessText>
            Please note that this information has been moved to the Outbreak tab.
          </SuccessText>
        </DialogContent>
        <DialogFooter>
          <OutlinedButton to="/alerts" onClick={handleClose}>
            Stay on Alerts
          </OutlinedButton>
          <Button to="/alerts/outbreaks" component={RouterLink}>
            Go to Outbreaks
          </Button>
        </DialogFooter>
      </Dialog>
    );
  }

  return (
    <Dialog onClose={handleClose} open={isOpen}>
      <form onSubmit={handleSubmit(handleConfirm)} noValidate>
        <DialogHeader onClose={handleClose} title="Confirm Outbreak" />
        <LoadingContainer isLoading={status === STATUS.LOADING}>
          <Content>
            <Fields>
              <Controller
                as={Select}
                placeholder="Please select"
                defaultValue=""
                rules={{ required: true }}
                control={control}
                name="diagnosis"
                label="Outbreak diagnosis"
                options={options}
                error={!!errors.diagnosis}
                helperText={errors.diagnosis && errors.diagnosis.message}
              />
              <DatePicker
                name="date"
                label="Confirmed Outbreak Date"
                error={!!errors.date}
                helperText={errors.date && errors.date.message}
                inputRef={register({
                  required: 'Required',
                })}
              />
            </Fields>
            <TextField
              name="note"
              placeholder="Add a note"
              error={!!errors.note}
              helperText={errors.note && errors.note.message}
              multiline
              rows="4"
              inputRef={register({
                required: 'Required',
              })}
            />
          </Content>
        </LoadingContainer>
        <DialogFooter>
          <OutlinedButton onClick={handleClose} disabled={status === STATUS.LOADING}>
            Cancel
          </OutlinedButton>
          <Button type="submit" isLoading={status === STATUS.LOADING} loadingText="Confirming">
            Confirm
          </Button>
        </DialogFooter>
      </form>
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
