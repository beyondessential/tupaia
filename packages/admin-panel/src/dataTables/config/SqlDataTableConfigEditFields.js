/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ParameterList, SQLQueryEditor } from '@tupaia/ui-components';
import { Accordion, AccordionDetails, AccordionSummary, Grid } from '@material-ui/core';

import PropTypes from 'prop-types';
import { useParameters } from '../useParameters';
import { useSqlEditor } from '../useSqlEditor';

export const SqlDataTableConfigEditFields = ({ onEditField, recordData }) => {
  const {
    additionalParameters,
    onParametersAdd,
    onParametersDelete,
    onParametersChange,
  } = useParameters({ onEditField, recordData });
  const { sql, setSql } = useSqlEditor({ onEditField, recordData });

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
              customKeywords={additionalParameters.map(p => p.name)}
              onChange={setSql}
              value={sql}
            />
          </Grid>
          <Grid item xs={4}>
            <ParameterList
              parameters={additionalParameters}
              onDelete={onParametersDelete}
              onAdd={onParametersAdd}
              onChange={onParametersChange}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

SqlDataTableConfigEditFields.propTypes = {
  onEditField: PropTypes.func.isRequired,
  recordData: PropTypes.object.isRequired,
};
