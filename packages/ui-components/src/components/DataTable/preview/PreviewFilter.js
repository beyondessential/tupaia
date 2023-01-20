/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';

import { ParametersType } from '../types';
import { typeOptions } from '../constants';

export const PreviewFilter = ({ parameters, onChange }) => {
  return (
    <Grid container spacing={2}>
      {parameters.map(p => {
        const option = typeOptions.find(t => t.value === p.type);
        const { FilterComponent } = option;
        if (FilterComponent) {
          return (
            <Grid item xs={Math.floor(12 / parameters.length)}>
              <FilterComponent
                {...p}
                onChange={newValue => {
                  onChange(p.id, 'inputFilterValue', newValue);
                }}
              />
            </Grid>
          );
        }
        return <div />;
      })}
    </Grid>
  );
};

PreviewFilter.propTypes = {
  parameters: ParametersType.isRequired,
  onChange: PropTypes.func.isRequired,
};

PreviewFilter.defaultProps = {};
