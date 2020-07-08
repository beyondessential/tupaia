/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Button,
  OutlinedButton,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DatePicker,
  Select,
  Checkbox,
  LoadingContainer,
} from '@tupaia/ui-components';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Typography from '@material-ui/core/Typography';
import { useForm, Controller } from 'react-hook-form';
import { FlexSpaceBetween, FlexStart } from '../Layout';
import { connectApi } from '../../api';
import * as COLORS from '../../constants';

import MuiInput from '@material-ui/core/Input';
import MuiInputLabel from '@material-ui/core/InputLabel';
import MuiMenuItem from '@material-ui/core/MenuItem';
import MuiFormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import MuiSelect from '@material-ui/core/Select';
import MuiCheckbox from '@material-ui/core/Checkbox';


const countries = [
  { label: 'All Countries', value: 'ALL' },
  { label: 'Afghanistan', value: 'AF' },
  { label: 'Albania', value: 'AL' },
  { label: 'Algeria', value: 'DZ' },
  { label: 'Angola', value: 'AO' },
  { label: 'Anguilla', value: 'AI' },
  { label: 'Antarctica', value: 'AQ' },
  { label: 'Argentina', value: 'AR' },
  { label: 'Armenia', value: 'AM' },
  { label: 'Aruba', value: 'AW' },
  { label: 'Australia', value: 'AU' },
  { label: 'Austria', value: 'AT' },
  { label: 'Azerbaijan', value: 'AZ' },
  { label: 'Bahamas', value: 'BS' },
  { label: 'Bahrain', value: 'BH' },
  { label: 'Bangladesh', value: 'BD' },
  { label: 'Barbados', value: 'BB' },
  { label: 'Belarus', value: 'BY' },
  { label: 'Belgium', value: 'BE' },
  { label: 'Belize', value: 'BZ' },
  { label: 'Benin', value: 'BJ' },
  { label: 'Bermuda', value: 'BM' },
  { label: 'Bhutan', value: 'BT' },
  { label: 'Bolivia', value: 'BO' },
  { label: 'Botswana', value: 'BW' },
  { label: 'Brazil', value: 'BR' },
  { label: 'Bulgaria', value: 'BG' },
  { label: 'Burundi', value: 'BI' },
  { label: 'Cambodia', value: 'KH' },
  { label: 'Cameroon', value: 'CM' },
  { label: 'Canada', value: 'CA' },
];

const syndromes = [
  { label: 'AFR', value: 'AFR' },
  { label: 'DIA', value: 'DIA' },
  { label: 'ILI', value: 'ILI' },
  { label: 'PF', value: 'PF' },
  { label: 'DLI', value: 'DLI' },
];

const STATUS = {
  INITIAL: 'initial',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};

const Checkboxes = styled(FlexStart)`
  margin-top: 1rem;
  margin-bottom: 2rem;
  padding-top: 2rem;
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};

  > div {
    margin-right: 0.4rem;
  }
`;

const Fields = styled(FlexSpaceBetween)`
  > div {
    &:first-child {
      position: relative;
      margin-right: 0.6rem;

      .MuiInputBase-root:after {
        content: '';
        position: absolute;
        left: 100%;
        top: 50%;
        width: 50px;
        border-top: 1px solid ${props => props.theme.palette.text.tertiary};
      }
    }

    &:last-child {
      margin-left: 0.6rem;
    }
  }
`;

const Content = styled(DialogContent)`
  text-align: left;
`;

const TickIcon = styled(CheckCircle)`
  font-size: 2.5rem;
  margin-bottom: 0.3rem;
  color: ${props => props.theme.palette.success.main};
`;

const SuccessText = styled(Typography)`
  font-size: 1rem;
  margin-top: 1rem;
`;

export const ExportModalComponent = ({ isOpen, handleClose, createExport }) => {
  const [country, setCountry] = React.useState([]);


  const { handleSubmit, register, errors, control } = useForm();
  const [status, setStatus] = useState(STATUS.INITIAL);

  const handleConfirm = async fields => {
    setStatus(STATUS.LOADING);
    await createExport(fields);
    setStatus(STATUS.SUCCESS);
  };

  if (status === STATUS.SUCCESS) {
    return (
      <Dialog onClose={handleClose} open={isOpen}>
        <DialogHeader onClose={handleClose} title="Export Weekly Case Data" />
        <DialogContent>
          <TickIcon />
          <Typography variant="h6" gutterBottom>
            Data successfully exported
          </Typography>
          <SuccessText>Please note that the data was exported to your browser.</SuccessText>
        </DialogContent>
        <DialogFooter>
          <OutlinedButton onClick={handleClose}>Close</OutlinedButton>
        </DialogFooter>
      </Dialog>
    );
  }

  const handleChange = (event) => {
    setCountry(event.target.value);
  };

  return (
    <Dialog onClose={handleClose} open={isOpen}>
      <form onSubmit={handleSubmit(handleConfirm)} noValidate>
        <DialogHeader onClose={handleClose} title="Export Weekly Case Data" />
        <LoadingContainer isLoading={status === STATUS.LOADING}>
          <Content>
            {/*<Controller*/}
            {/*  as={Select}*/}
            {/*  defaultValue="ALL"*/}
            {/*  rules={{ required: true }}*/}
            {/*  control={control}*/}
            {/*  name="countries"*/}
            {/*  label="Select Counties"*/}
            {/*  options={countries}*/}
            {/*  error={!!errors.diagnosis}*/}
            {/*  helperText={errors.diagnosis && errors.diagnosis.message}*/}
            {/*/>*/}

            <MuiFormControl>
              <MuiInputLabel id="demo-mutiple-checkbox-label">Tag</MuiInputLabel>
              <Select
                labelId="demo-mutiple-checkbox-label"
                id="demo-mutiple-checkbox"
                multiple
                value={country.label}
                onChange={handleChange}
                input={<MuiInput />}
                renderValue={(selected) => selected.join(', ')}
                MenuProps={MenuProps}
              >
                {countries.map((country) => (
                  <MuiMenuItem key={country.value} value={country.value}>
                    <Checkbox checked={country.indexOf(name) > -1} />
                    <ListItemText primary={country.value} />
                  </MuiMenuItem>
                ))}
              </Select>
            </MuiFormControl>

            <Fields>
              <DatePicker
                name="startWeek"
                label="Start Week"
                error={!!errors.startWeek}
                helperText={errors.startWeek && errors.startWeek.message}
                inputRef={register({
                  required: 'Required',
                })}
              />
              <DatePicker
                name="endWeek"
                label="End Week"
                error={!!errors.endWeek}
                helperText={errors.endWeek && errors.endWeek.message}
                inputRef={register({
                  required: 'Required',
                })}
              />
            </Fields>
            <Checkboxes>
              {syndromes.map(syndrome => (
                <Checkbox
                  key={syndrome.value}
                  label={syndrome.label}
                  name={syndrome.value}
                  color="primary"
                  defaultChecked
                />
              ))}
            </Checkboxes>
            <Checkbox label="Include all Sentinel sites" color="primary" defaultChecked />
          </Content>
        </LoadingContainer>
        <DialogFooter>
          <OutlinedButton onClick={handleClose} disabled={status === STATUS.LOADING}>
            Cancel
          </OutlinedButton>
          <Button type="submit" isLoading={status === STATUS.LOADING} loadingText="Exporting">
            Export
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

ExportModalComponent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  createExport: PropTypes.func.isRequired,
};

const mapApiToProps = api => ({
  createExport: () => api.post(),
});

export const ExportModal = connectApi(mapApiToProps)(ExportModalComponent);
