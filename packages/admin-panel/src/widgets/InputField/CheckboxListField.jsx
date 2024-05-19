/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import {
  FormControl,
  FormControlLabel,
  FormGroup as MuiFormGroup,
  FormLabel,
} from '@material-ui/core';
import { get } from '../../VizBuilderApp/api/api';
import { Checkbox } from '../Checkbox';
import { convertSearchTermToFilter } from '../../utilities';

const useOptions = (
  endpoint,
  baseFilter,
  searchTerm,
  labelColumn,
  valueColumn,
  distinct = null,
) => {
  return useQuery(
    ['options', endpoint, baseFilter, searchTerm, labelColumn, valueColumn, distinct],
    async () => {
      const filter = convertSearchTermToFilter({ ...baseFilter, [labelColumn]: searchTerm });
      return get(endpoint, {
        params: {
          filter: JSON.stringify(filter),
          sort: JSON.stringify([`${labelColumn} ASC`]),
          columns: JSON.stringify([labelColumn, valueColumn]),
          pageSize: 10,
          distinct,
        },
      });
    },
    { enabled: !!endpoint },
  );
};

const Container = styled.div`
  height: 100%;
  max-height: 15rem;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.palette.grey['400']};
  padding-inline: 1rem;
  padding-block-start: 0.5rem;
  border-radius: 4px;
  margin-block-start: 0.5rem;
`;

const FormGroup = styled(MuiFormGroup)`
  flex: 1;
`;

const Legend = styled(FormLabel).attrs({
  component: 'legend',
})`
  &.Mui-focused {
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;

export const CheckboxListField = ({
  endpoint,
  baseFilter,
  optionLabelKey,
  optionValueKey,
  label,
  required,
  distinct = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: options, isLoading } = useOptions(
    endpoint,
    baseFilter,
    searchTerm,
    optionLabelKey,
    optionValueKey,
    distinct,
  );

  return (
    <FormControl component="fieldset" required={required}>
      <Legend>{label}</Legend>
      <Container>
        <FormGroup>
          {isLoading && <div>Loading...</div>}
          {options &&
            options.map(option => (
              <FormControlLabel
                key={option[optionValueKey]}
                control={
                  <Checkbox
                    name={option[optionValueKey]}
                    value={option[optionValueKey]}
                    label={option[optionLabelKey]}
                    color="primary"
                    size="small"
                  />
                }
                label={option[optionLabelKey]}
              />
            ))}
        </FormGroup>
      </Container>
    </FormControl>
  );
};

CheckboxListField.propTypes = {
  endpoint: PropTypes.string.isRequired,
  baseFilter: PropTypes.object,
  optionLabelKey: PropTypes.string.isRequired,
  optionValueKey: PropTypes.string.isRequired,
  distinct: PropTypes.bool,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
};

CheckboxListField.defaultProps = {
  baseFilter: {},
  distinct: null,
  required: false,
};
