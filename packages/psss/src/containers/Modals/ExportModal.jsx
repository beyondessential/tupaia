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
  LoadingContainer,
  MultiSelect,
} from '@tupaia/ui-components';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Typography from '@material-ui/core/Typography';
import { useForm, Controller } from 'react-hook-form';
import { FlexSpaceBetween, ComingSoon } from '../../components';
import { createExport } from '../../api';

// Todo replace with data from api
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

const STATUS = {
  INITIAL: 'initial',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};

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

export const ExportModal = ({ renderCustomFields, isOpen, handleClose }) => {
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

  return (
    <Dialog onClose={handleClose} open={isOpen}>
      <ComingSoon text="The Modal dialog will enable you to export report data." />
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
                required: true,
                name: 'countries',
                // This is a work around for with MaterialUI inputRefs
                // @see https://github.com/react-hook-form/react-hook-form/issues/380
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
              <Controller
                as={<DatePicker label="Start Week" name="startWeek" />}
                control={control}
                name="startWeek"
                defaultValue={new Date()}
                error={!!errors.startWeek}
                helperText={errors.startWeek && errors.startWeek.message}
                inputRef={register({
                  required: 'Required',
                })}
              />
              <Controller
                as={<DatePicker label="End Week" name="endWeek" />}
                control={control}
                name="endWeek"
                defaultValue={new Date()}
                error={!!errors.endWeek}
                helperText={errors.endWeek && errors.endWeek.message}
                inputRef={register({
                  required: 'Required',
                })}
              />
            </Fields>
            {renderCustomFields(register, errors)}
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

ExportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  renderCustomFields: PropTypes.func.isRequired,
};
