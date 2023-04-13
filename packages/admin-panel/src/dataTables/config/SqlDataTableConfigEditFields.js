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
  additionalParams,
  onParamsAdd,
  onParamsDelete,
  onParamsChange,
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
              customKeywords={additionalParams.map(p => p.name)}
              onChange={setSql}
              value={sql}
            />
          </Grid>
          <Grid item xs={4}>
            <ParameterList onAdd={onParamsAdd}>
              {additionalParams.map(({ id, config, ...other }) => {
                return (
                  <ParameterItem
                    key={id}
                    id={id}
                    {...config}
                    {...other}
                    onDelete={onParamsDelete}
                    onChange={onParamsChange}
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
  additionalParams: PropTypes.array.isRequired,
  onEditField: PropTypes.func.isRequired,
  onParamsAdd: PropTypes.func.isRequired,
  onParamsChange: PropTypes.func.isRequired,
  onParamsDelete: PropTypes.func.isRequired,
  recordData: PropTypes.object.isRequired,
};
