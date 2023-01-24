/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';

import { ParametersType } from '../editing/types';
import { FilterTypeOptions } from './filters';

export const PreviewFilters = ({ parameters, onChange }) => {
  return (
    <Grid container spacing={2}>
      {parameters.map(p => {
        const option = FilterTypeOptions.find(t => t.value === p.type);
        if (option) {
          const { FilterComponent } = option;
          return (
            <Grid key={p.id} item xs={Math.floor(12 / parameters.length)}>
              <FilterComponent
                {...p}
                onChange={newValue => {
                  onChange(p.id, 'inputFilterValue', newValue);
                }}
              />
            </Grid>
          );
        }
        return <div key={p.id} />;
      })}
    </Grid>
  );
};

PreviewFilters.propTypes = {
  parameters: ParametersType.isRequired,
  onChange: PropTypes.func.isRequired,
};

PreviewFilters.defaultProps = {};
