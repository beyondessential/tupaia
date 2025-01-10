import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Checkbox } from '@tupaia/ui-components';
import { ExportModal } from './ExportModal';
import { FlexStart } from '../../components/Layout';

// Todo replace with api data
const syndromes = [
  { label: 'AFR', value: 'AFR' },
  { label: 'DIA', value: 'DIA' },
  { label: 'ILI', value: 'ILI' },
  { label: 'PF', value: 'PF' },
  { label: 'DLI', value: 'DLI' },
];

const Checkboxes = styled(FlexStart)`
  margin-top: 1rem;
  padding-top: 2rem;
  border-top: 1px solid ${props => props.theme.palette.grey['400']};

  > div {
    margin-right: 0.4rem;
  }
`;

export const AlertsExportModal = ({ isOpen, handleClose }) => (
  <ExportModal
    isOpen={isOpen}
    handleClose={handleClose}
    renderCustomFields={register => (
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
  />
);

AlertsExportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};
