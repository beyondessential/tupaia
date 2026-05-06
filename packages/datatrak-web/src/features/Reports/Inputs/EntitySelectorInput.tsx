import React, { useEffect, useState } from 'react';
import { throttle } from 'es-toolkit/compat';
import { Controller, useFormContext } from 'react-hook-form';
import { useEntities } from '../../../api';
import { InputHelperText } from '../../../components';
import { COUNTRY_LEVEL_ENTITY, ENTITY_LEVEL_ENTITY } from '../constants';
import { ReportAutocomplete } from './ReportAutocomplete';
import { InputWrapper } from './InputWrapper';

interface EntitySelectorInputProps {
  selectedEntityLevel?: typeof ENTITY_LEVEL_ENTITY | typeof COUNTRY_LEVEL_ENTITY;
}

export const EntitySelectorInput = ({ selectedEntityLevel }: EntitySelectorInputProps) => {
  const [searchText, setSearchText] = useState('');

  const { errors } = useFormContext();

  const isCountryInput = selectedEntityLevel === COUNTRY_LEVEL_ENTITY;

  const { data: entities, isLoading } = useEntities({
    filter: {
      type: {
        comparator: isCountryInput ? '=' : '!=',
        comparisonValue: COUNTRY_LEVEL_ENTITY,
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
    setSearchText('');
  }, [selectedEntityLevel]);

  const label = isCountryInput ? 'Country' : 'Entities';

  const error = errors[selectedEntityLevel];

  return (
    <InputWrapper>
      <Controller
        name={selectedEntityLevel}
        rules={{ required: 'Required' }}
        render={({ ref, onChange, value, name }, { invalid }) => (
          <ReportAutocomplete
            label={label}
            loading={isLoading}
            error={invalid}
            id={selectedEntityLevel}
            getOptionSelected={(option, selected) => option.value === selected.value}
            options={
              entities?.map(({ name: entityName, id, code, type: entityType }) => ({
                label: entityName,
                value: id,
                secondaryLabel: code,
                code,
                type: entityType,
              })) ?? []
            }
            getOptionLabel={option => option.label}
            placeholder={`Select ${label.toLowerCase()}...`}
            onInputChange={throttle((e, newValue) => {
              if (!e?.target) return;
              setSearchText(newValue);
            }, 200)}
            required
            inputRef={ref}
            name={name}
            inputValue={searchText}
            muiProps={{
              multiple: !isCountryInput,
            }}
            onChange={(_, newValue) => {
              // the onChange function expected by react-hook-form and mui are different
              onChange(newValue);
            }}
            value={value}
            aria-describedby={invalid ? 'entities-error-message' : undefined}
          />
        )}
      />
      {error && (
        <InputHelperText error id="entities-error-message">
          {(error as Error).message}
        </InputHelperText>
      )}
    </InputWrapper>
  );
};
