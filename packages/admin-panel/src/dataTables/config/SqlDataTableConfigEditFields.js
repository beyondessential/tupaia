/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { SQLQueryEditor } from '@tupaia/ui-components';
import { Accordion, AccordionDetails, AccordionSummary, Grid } from '@material-ui/core';

import PropTypes from 'prop-types';
import { ParameterList, ParameterItem } from '../components/editing';
import { useSqlEditor } from '../useSqlEditor';

export const SqlDataTableConfigEditFields = ({
  onEditField,
  recordData,
  additionalParameters,
  onParametersAdd,
  onParametersDelete,
  onParametersChange,
}) => {
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
            <ParameterList onAdd={onParametersAdd}>
              {additionalParameters.map(({ id, config, ...other }) => {
                return (
                  <ParameterItem
                    key={id}
                    id={id}
                    {...config}
                    {...other}
                    onDelete={onParametersDelete}
                    onChange={onParametersChange}
                  />
                );
              })}
            </ParameterList>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

SqlDataTableConfigEditFields.propTypes = {
  additionalParameters: PropTypes.array.isRequired,
  onEditField: PropTypes.func.isRequired,
  onParametersAdd: PropTypes.func.isRequired,
  onParametersChange: PropTypes.func.isRequired,
  onParametersDelete: PropTypes.func.isRequired,
  recordData: PropTypes.object.isRequired,
};
