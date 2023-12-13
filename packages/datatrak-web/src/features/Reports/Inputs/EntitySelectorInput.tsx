/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import throttle from 'lodash.throttle';
import { Controller, useFormContext } from 'react-hook-form';
import { useEntities } from '../../../api';
import { InputHelperText } from '../../../components';
import { Autocomplete } from './Autocomplete';
import { InputWrapper } from './InputWrapper';

interface AsyncAutocompleteProps {
  entityLevel?: 'country' | 'entity';
}

export const EntitySelectorInput = ({ entityLevel }: AsyncAutocompleteProps) => {
  const [searchText, setSearchText] = useState('');

  const { watch, errors } = useFormContext();

  const selectedEntityLevel = watch('entityLevel');
  const isActive = selectedEntityLevel === entityLevel;

  const { data: entities, isLoading } = useEntities({
    filter: {
      type: {
        comparator: entityLevel === 'country' ? '=' : '!=',
        comparisonValue: 'country',
      },
      name: searchText
        ? {
            comparator: 'ilike',
            comparisonValue: `%${searchText}%`,
          }
        : undefined,
    },
    limit: 10,
    sort: ['name ASC'],
  });

  useEffect(() => {
    // Reset search text when input is hidden
    if (!isActive) {
      setSearchText('');
    }
  }, [isActive]);

  if (!isActive) return null;

  const label = entityLevel === 'country' ? 'Country' : 'Entities';

  return (
    <InputWrapper>
      <Controller
        name={entityLevel}
        rules={{ required: 'Required' }}
        render={({ ref, onChange, value, name }, { invalid }) => (
          <Autocomplete
            label={label}
            loading={isLoading}
            error={invalid}
            options={
              entities?.map(({ name: entityName, id, code, type: entityType }) => ({
                label: entityName,
                value: id,
                code,
                type: entityType,
              })) ?? []
            }
            getOptionLabel={option => option.label}
            placeholder={`Select ${label.toLowerCase()}...`}
            onInputChange={throttle((_, newValue) => {
              setSearchText(newValue);
            }, 200)}
            required
            inputRef={ref}
            name={name}
            inputValue={searchText}
            muiProps={{
              multiple: entityLevel === 'entity',
            }}
            onChange={(_, newValue) => {
              // the onChange function expected by react-hook-form and mui are different
              onChange(newValue);
            }}
            value={value}
          />
        )}
      />
      {errors[entityLevel] && (
        <InputHelperText error>{(errors[entityLevel] as Error).message}</InputHelperText>
      )}
    </InputWrapper>
  );
};
