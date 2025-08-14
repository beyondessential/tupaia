import React from 'react';
import PropTypes from 'prop-types';
import { Select } from '@tupaia/ui-components';
import { ExportModal } from './ExportModal';

// Todo replace with api data
const syndromes = [
  { label: 'AFR', value: 'AFR' },
  { label: 'DIA', value: 'DIA' },
  { label: 'ILI', value: 'ILI' },
  { label: 'PF', value: 'PF' },
  { label: 'DLI', value: 'DLI' },
];

export const OutbreaksExportModal = ({ isOpen, handleClose }) => (
  <ExportModal
    isOpen={isOpen}
    handleClose={handleClose}
    renderCustomFields={(register, errors) => (
      <Select
        placeholder="Please select"
        defaultValue=""
        rules={{ required: true }}
        name="diagnosis"
        label="Diagnosis"
        options={syndromes}
        error={!!errors.diagnosis}
        helperText={errors.diagnosis && errors.diagnosis.message}
        inputProps={{
          name: 'diagnosis',
          // This is a work around for with MaterialUI inputRefs
          // @see https://github.com/react-hook-form/react-hook-form/issues/380
          inputRef: ref => {
            if (!ref) return;
            register({ required: true, name: 'diagnosis', value: ref.value });
          },
        }}
      />
    )}
  />
);

OutbreaksExportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};
