import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from 'styled-components';
import { Divider as BaseDivider } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import BaseDeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import {
  FlexStart,
  Checkbox as BaseCheckbox,
  Select,
  TextField,
  IconButton as BaseIconButton,
} from '@tupaia/ui-components';
import { FilterTypeOptions } from '../PreviewFilters';
import { DefaultValueType } from './types';

const Divider = styled(BaseDivider)`
  margin-bottom: 20px;
`;

const Checkbox = styled(BaseCheckbox)`
  .MuiSvgIcon-root {
    font-size: 0.9rem;
  }
  .MuiTypography-body1 {
    font-size: 0.9rem;
  }
`;

const IconButton = styled(BaseIconButton)`
  top: 35px;
  width: 30%;
  height: 20px;
`;
const DeleteOutlinedIcon = styled(BaseDeleteOutlinedIcon)`
  font-size: 25px;
`;

export const ParameterItem = props => {
  const { id, name, type, defaultValue, hasError, error, onDelete, onChange } = props;

  const [hasDefaultValue, setHasDefaultValue] = useState(defaultValue !== undefined);
  const option = FilterTypeOptions.find(t => t.value === type) || {};
  const { FilterComponent } = option;

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
            id={id}
            value={type}
            label="Type"
            options={FilterTypeOptions}
            onChange={event => {
              onChange(id, 'type', event.target.value);
              onChange(id, 'defaultValue', undefined);
            }}
          />
        </Grid>
        <Grid item xs={1}>
          <IconButton variant="text" onClick={() => onDelete(id)}>
            <DeleteOutlinedIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <FlexStart>
          <Checkbox
            label="Add default value"
            color="primary"
            checked={hasDefaultValue}
            onChange={event => {
              setHasDefaultValue(event.target.checked);
              if (!event.target.checked) {
                onChange(id, 'defaultValue', undefined);
              }
            }}
          />
        </FlexStart>
      </Grid>
      {hasDefaultValue && (
        <Grid item xs={5}>
          {FilterComponent && (
            <FilterComponent
              name={name}
              value={defaultValue}
              label="Default value"
              onChange={newValue => {
                onChange(id, 'defaultValue', newValue);
              }}
            />
          )}
        </Grid>
      )}
      <Grid item xs={10}>
        <Divider />
      </Grid>
    </Grid>
  );
};

ParameterItem.propTypes = {
  defaultValue: DefaultValueType,
  error: PropTypes.string,
  hasError: PropTypes.bool,
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  type: PropTypes.string,
  onDelete: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

ParameterItem.defaultProps = {
  defaultValue: undefined,
  error: '',
  hasError: false,
  name: '',
  type: '',
};
