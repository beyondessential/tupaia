/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ParameterList, SQLQueryEditor, TextField } from '@tupaia/ui-components';
import { Accordion, AccordionDetails, AccordionSummary, Grid } from '@material-ui/core';

import PropTypes from 'prop-types';
import { useDataTable } from '../useDataTable';

export const SqlDataTableConfigEditFields = ({ onEditField, recordData }) => {
  const {
    parameters,
    onParametersAdd,
    onParametersDelete,
    onParametersChange,
    sql,
    setSql,
  } = useDataTable({ onEditField, recordData });

  return (
    <Accordion defaultExpanded>
      <AccordionSummary>
        <Grid container spacing={1}>
          <Grid item xs={8}>
            Config
          </Grid>
          <Grid item xs={4}>
            Parameters
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={1}>
          <Grid item xs={8}>
            <SQLQueryEditor
              customKeywords={parameters.map(p => p.name)}
              onChange={setSql}
              value={sql}
            />
          </Grid>
          <Grid item xs={4}>
            <ParameterList
              parameters={parameters}
              onDelete={onParametersDelete}
              onAdd={onParametersAdd}
              onChange={onParametersChange}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
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
    </Accordion>
  );
};

SqlDataTableConfigEditFields.propTypes = {
  onEditField: PropTypes.func.isRequired,
  recordData: PropTypes.object.isRequired,
};
