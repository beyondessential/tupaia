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
import { Checkbox, Select as BaseSelect, TextField as BaseTextField } from '../Inputs';
import { IconButton as BaseButton } from '../IconButton';
import { FlexStart } from '../Layout';
import { ParametersType } from './types';
import { typeOptions } from './constants';

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

export const ParameterList = ({ parameters, setParameters }) => {
  const onDelete = selectedParameterId => {
    const newParameterList = parameters.filter(p => p.id !== selectedParameterId);
    setParameters(newParameterList);
  };

  const onChange = (id, key, targetKey = 'value') => event => {
    const newParameters = [...parameters];
    const index = parameters.findIndex(p => p.id === id);

    // validate name input
    if (key === 'name') {
      try {
        const newValue = event.target[targetKey];

        if (newValue === '') {
          throw new Error('Cannot be empty');
        }

        if (parameters.findIndex(p => p.name === newValue) !== -1) {
          throw new Error('Duplicated parameter name');
        }

        const regex = new RegExp('^[A-Za-z0-9_]+$');
        if (!regex.test(newValue)) {
          throw new Error('Contains space or special characters');
        }

        newParameters[index].hasError = false;
        newParameters[index].error = '';
      } catch (e) {
        newParameters[index].hasError = true;
        newParameters[index].error = e.message;
      }
    }

    newParameters[index][key] = event.target[targetKey];
    setParameters(newParameters);
  };

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
                    onChange={onChange(id, 'name')}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Select
                    value={type}
                    label="Type"
                    options={typeOptions}
                    onChange={onChange(id, 'type')}
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
                    onChange={onChange(id, 'required', 'checked')}
                  />
                  <Checkbox
                    label="Add default value"
                    color="primary"
                    checked={hasDefaultValue}
                    onChange={onChange(id, 'hasDefaultValue', 'checked')}
                  />
                </FlexStart>
              </Grid>
              {hasDefaultValue && (
                <Grid item xs={5}>
                  <TextField
                    value={defaultValue}
                    placeholder="Text"
                    label="Default value"
                    onChange={onChange(id, 'defaultValue')}
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
  setParameters: PropTypes.func.isRequired,
  parameters: ParametersType.isRequired,
};

ParameterList.defaultProps = {};
