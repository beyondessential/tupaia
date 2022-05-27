/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import PropTypes from 'prop-types';
import { FlexSpaceBetween } from '@tupaia/ui-components';
import Pagination from '@material-ui/lab/Pagination';
import { useExportOptions } from '../context/ExportOptionsContext';

export const OptionsBar = ({ totalPage, setPage }) => {
  const {
    exportWithLabels,
    toggleExportWithLabels,
    exportWithTable,
    toggleExportWithTable,
  } = useExportOptions();

  return (
    <FlexSpaceBetween>
      <FormControlLabel
        control={
          <Switch checked={exportWithLabels} onChange={toggleExportWithLabels} color="primary" />
        }
        label="Labels"
      />
      <FormControlLabel
        control={
          <Switch checked={exportWithTable} onChange={toggleExportWithTable} color="primary" />
        }
        label="Table"
      />
      <Pagination count={totalPage} shape="rounded" onChange={(event, value) => setPage(value)} />
    </FlexSpaceBetween>
  );
};

OptionsBar.propTypes = {
  totalPage: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
};
