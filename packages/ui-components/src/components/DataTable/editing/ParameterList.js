/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Divider as BaseDivider } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import BaseDeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import { Checkbox as BaseCheckbox, Select, TextField } from '../../Inputs';
import { IconButton as BaseIconButton } from '../../IconButton';
import { FlexStart } from '../../Layout';
import { ParametersType } from './types';
import { FilterTypeOptions } from '../PreviewFilters';
import { TextButton as BaseTextButton } from '../../Button';

const TextButton = styled(BaseTextButton)`
  font-weight: 500;
  line-height: 18px;
  font-size: 14px;
  text-underline-offset: 3px;
  text-decoration: underline;
  :hover {
    text-decoration: underline;
  }
`;

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

export const ParameterList = ({ parameters, onDelete, onChange, onAdd }) => {
  const parameterListRef = useRef();
  const [scrollToTheBottom, setScrollToTheBottom] = useState(0);

  useEffect(() => {
    if (parameterListRef.current) {
      parameterListRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [scrollToTheBottom]);

  return (
    <div>
      <div>
        {parameters.map(
          ({
            id,
            name = '',
            type = '',
            required = false,
            hasDefaultValue = false,
            defaultValue = '',
            hasError = false,
            error = '',
          }) => {
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
        <div ref={parameterListRef} />
      </div>
      <TextButton
        color="primary"
        onClick={() => {
          onAdd();
          setScrollToTheBottom(scrollToTheBottom + 1);
        }}
      >
        + Add
      </TextButton>
    </div>
  );
};

ParameterList.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  parameters: ParametersType.isRequired,
};
