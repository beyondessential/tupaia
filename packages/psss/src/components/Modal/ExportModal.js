/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import {
  Button,
  OutlinedButton,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DatePicker,
  Checkbox,
  LoadingContainer,
  MultiSelect,
  Select,
} from '@tupaia/ui-components';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Typography from '@material-ui/core/Typography';
import { useForm } from 'react-hook-form';
import { FlexSpaceBetween, FlexStart } from '../Layout';
import { connectApi } from '../../api';

const countries = [
  { label: 'All Countries', value: 'All' },
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

const getLabelForValue = value => countries.find(option => option.value === value).label;

const getRouteNameByPath = path => {
  let type = 'home';

  if (path.includes('weekly-report')) {
    type = 'weekly-reports';
  } else if (path === '/alerts') {
    type = 'alerts';
  } else if (path === '/alerts/outbreaks') {
    type = 'outbreaks';
  }

  return type;
};

export const ExportModalComponent = ({ isOpen, handleClose, createExport }) => {
  const { handleSubmit, register, errors } = useForm();
  const [status, setStatus] = useState(STATUS.INITIAL);

  const location = useLocation();
  const routeName = getRouteNameByPath(location.pathname);

  console.log('location', location, routeName);

  const handleConfirm = async fields => {
    console.log('FIELDS...', fields);
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

  return (
    <Dialog onClose={handleClose} open={isOpen}>
      <form onSubmit={handleSubmit(handleConfirm)} noValidate>
        <DialogHeader onClose={handleClose} title="Export Weekly Case Data" />
        <LoadingContainer isLoading={status === STATUS.LOADING}>
          <Content>
            <MultiSelect
              defaultValue={['All']}
              id="countries"
              label="Select Counties"
              options={countries}
              error={!!errors.diagnosis}
              inputProps={{
                name: 'countries',
                inputRef: ref => {
                  if (!ref) return;
                  register({ name: 'countries', value: ref.value });
                },
              }}
              helperText={errors.diagnosis && errors.diagnosis.message}
              renderValue={values =>
                values.length > 1
                  ? `${values.length} Countries Selected`
                  : getLabelForValue(values[0])
              }
            />

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
            {routeName !== 'outbreaks' && (
              <Checkboxes>
                {syndromes.map(syndrome => (
                  <Checkbox
                    key={syndrome.value}
                    label={syndrome.label}
                    name={syndrome.value}
                    color="primary"
                    defaultChecked
                    inputRef={register()}
                  />
                ))}
              </Checkboxes>
            )}
            {(routeName === 'home' || routeName === 'weekly-reports') && (
              <Checkbox
                label="Include all Sentinel sites"
                color="primary"
                defaultChecked
                inputRef={register()}
              />
            )}
            {routeName === 'outbreaks' && (
              <Select
                placeholder="Please select"
                defaultValue=""
                rules={{ required: true }}
                name="diagnosis"
                label="Diagnosis"
                options={syndromes}
                error={!!errors.diagnosis}
                helperText={errors.diagnosis && errors.diagnosis.message}
              />
            )}
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
