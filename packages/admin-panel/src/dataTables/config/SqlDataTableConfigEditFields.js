/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { TextField } from '@tupaia/ui-components';
import PropTypes from 'prop-types';

export const SqlDataTableConfigEditFields = ({ recordData }) => {
  return (
    <>
      <TextField
        label="Sql"
        name="config.sql"
        required
        inputProps={{ readOnly: true }}
        value={recordData?.config?.sql}
      />
      <TextField
        label="Database Connection"
        name="config.externalDatabaseConnectionCode"
        required
        inputProps={{ readOnly: true }}
        value={recordData?.config?.externalDatabaseConnectionCode}
      />
    </>
  );
};

SqlDataTableConfigEditFields.propTypes = {
  recordData: PropTypes.object.isRequired,
};
