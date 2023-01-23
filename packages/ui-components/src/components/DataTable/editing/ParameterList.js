/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { Divider as BaseDivider } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import BaseDeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import { Checkbox, Select as BaseSelect, TextField as BaseTextField } from '../../Inputs';
import { IconButton as BaseButton } from '../../IconButton';
import { FlexStart } from '../../Layout';
import { ParametersType } from './types';
import { FilterTypeOptions } from '../PreviewFilters';

const RootDiv = styled.div`
  flexgrow: 1;
`;

const Divider = styled(BaseDivider)`
  margin-bottom: 20px;
`;

const TextField = styled(BaseTextField)``;

const Select = styled(BaseSelect)``;

const Button = styled(BaseButton)`
  top: 20%;
  width: 40%;
  height: 40%;
`;
const DeleteOutlinedIcon = styled(BaseDeleteOutlinedIcon)`
  font-size: 35px;
`;

export const ParameterList = ({ parameters, onDelete, onChange }) => {
  return (
    <RootDiv>
      {parameters.map(
        ({ id, name = '', type, required, hasDefaultValue, defaultValue, hasError, error }) => {
          return (
            <Grid container spacing={0} key={id}>
              <Grid container spacing={2}>
                <Grid item xs={5}>
                  <TextField
                    error={hasError}
                    helperText={hasError && error}
                    value={name}
                    placeholder="Text"
                    label="Name"
                    onChange={event => {
                      onChange(id, 'name', event.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Select
                    value={type}
                    label="Type"
                    options={FilterTypeOptions}
                    onChange={event => {
                      onChange(id, 'type', event.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={1}>
                  <Button variant="text" onClick={() => onDelete(id)}>
                    <DeleteOutlinedIcon />
                  </Button>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <FlexStart>
                  <Checkbox
                    label="Required"
                    color="primary"
                    checked={required}
                    onChange={event => {
                      onChange(id, 'required', event.target.checked);
                    }}
                  />
                  <Checkbox
                    label="Add default value"
                    color="primary"
                    checked={hasDefaultValue}
                    onChange={event => {
                      onChange(id, 'hasDefaultValue', event.target.checked);
                    }}
                  />
                </FlexStart>
              </Grid>
              {hasDefaultValue && (
                <Grid item xs={5}>
                  <TextField
                    value={defaultValue}
                    placeholder="Text"
                    label="Default value"
                    onChange={event => {
                      onChange(id, 'defaultValue', event.target.value);
                    }}
                  />
                </Grid>
              )}
              <Grid item xs={10}>
                <Divider />
              </Grid>
            </Grid>
          );
        },
      )}
    </RootDiv>
  );
};

ParameterList.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  parameters: ParametersType.isRequired,
};
