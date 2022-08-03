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

export const OptionsBar = ({ totalPage, page, setPage, isDisabled, exportOptions }) => {
  const {
    exportWithLabels,
    toggleExportWithLabels,
    exportWithTable,
    toggleExportWithTable,
  } = exportOptions;

  return (
    <FlexEnd>
      <FormControlLabel
        control={
          <Switch
            checked={exportWithLabels}
            onChange={toggleExportWithLabels}
            color="primary"
            disabled={isDisabled}
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
            disabled={isDisabled}
          />
        }
        label="Tables"
      />
      <Pagination
        page={page}
        count={totalPage}
        shape="rounded"
        onChange={(event, value) => setPage(value)}
        disabled={isDisabled}
      />
    </FlexEnd>
  );
};

OptionsBar.propTypes = {
  page: PropTypes.number.isRequired,
  totalPage: PropTypes.number.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  setPage: PropTypes.func.isRequired,
  exportOptions: PropTypes.object.isRequired,
};
