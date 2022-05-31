/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import PropTypes from 'prop-types';
import { FlexEnd } from '@tupaia/ui-components';
import Pagination from '@material-ui/lab/Pagination';
import { useExportOptions } from '../context/ExportOptionsContext';

export const OptionsBar = ({ totalPage, setPage, isExporting }) => {
  const {
    exportWithLabels,
    toggleExportWithLabels,
    exportWithTable,
    toggleExportWithTable,
  } = useExportOptions();

  return (
    <FlexEnd>
      <FormControlLabel
        control={
          <Switch
            checked={exportWithLabels}
            onChange={toggleExportWithLabels}
            color="primary"
            disabled={isExporting}
          />
        }
        label="Labels"
      />
      <FormControlLabel
        control={
          <Switch
            checked={exportWithTable}
            onChange={toggleExportWithTable}
            color="primary"
            disabled={isExporting}
          />
        }
        label="Table"
      />
      <Pagination count={totalPage} shape="rounded" onChange={(event, value) => setPage(value)} />
    </FlexEnd>
  );
};

OptionsBar.propTypes = {
  totalPage: PropTypes.number.isRequired,
  isExporting: PropTypes.bool.isRequired,
  setPage: PropTypes.func.isRequired,
};
