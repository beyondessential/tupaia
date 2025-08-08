import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
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
  margin-bottom: 2rem;
  padding-top: 2rem;
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};

  > div {
    margin-right: 0.4rem;
  }
`;

export const WeeklyReportsExportModal = ({ isOpen, handleClose }) => (
  <ExportModal
    isOpen={isOpen}
    handleClose={handleClose}
    renderCustomFields={register => (
      <>
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
        <Checkbox
          name="includeAllSites"
          label="Include all Sentinel sites"
          color="primary"
          defaultChecked
          inputRef={register()}
        />
      </>
    )}
  />
);

WeeklyReportsExportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};
