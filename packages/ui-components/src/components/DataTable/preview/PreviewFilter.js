/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';

import { ParametersType } from '../types';
import { typeOptions } from '../constants';

export const PreviewFilter = ({ parameters, modifyParameter }) => {
  return (
    <Grid container spacing={2}>
      {parameters.map((p, index) => {
        const option = typeOptions.find(t => t.value === p.type);
        const { FilterComponent } = option;
        if (FilterComponent) {
          return (
            <Grid item xs={Math.floor(12 / parameters.length)}>
              <FilterComponent
                {...p}
                index={index}
                onChange={newValue => {
                  modifyParameter(index, 'inputFilterValue', newValue);
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
  modifyParameter: PropTypes.func.isRequired,
};

PreviewFilter.defaultProps = {};
