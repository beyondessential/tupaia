/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useFormContext } from 'react-hook-form';
import { FormHelperText, Typography } from '@material-ui/core';
import { SpinningLoader, useDebounce } from '@tupaia/ui-components';
import { useEntityById, useProjectEntities } from '../../api';
import { ResultsList } from './ResultsList';
import { SearchField } from './SearchField';

const Container = styled.div`
  width: 100%;
  z-index: 0;

  fieldset:disabled & {
    pointer-events: none;
  }
`;

const Label = styled(Typography).attrs({
  variant: 'h4',
})`
  font-size: 1rem;
  cursor: pointer;
`;

const useSearchResults = (searchValue, filter, projectCode) => {
  const debouncedSearch = useDebounce(searchValue!, 200);
  return useProjectEntities(projectCode, {
    fields: ['id', 'parent_name', 'code', 'name', 'type'],
    filter,
    searchString: debouncedSearch,
  });
};

interface EntitySelectorProps {
  id: string;
  label?: string | null;
  detailLabel?: string | null;
  name?: string | null;
  required?: boolean | null;
  controllerProps: {
    onChange: (value: string) => void;
    value: string;
    ref: any;
    invalid: boolean;
  };
  config: any;
  showLabel: boolean;
  filter?: Record<string, string | string[]>;
  projectCode?: string;
  showRecentEntities?: boolean;
}

export const EntitySelector = ({
  id,
  label,
  detailLabel,
  name,
  required,
  controllerProps: { onChange, value, ref, invalid },
  filter,
  projectCode,
  showLabel,
  showRecentEntities,
}: EntitySelectorProps) => {
  const { errors } = useFormContext();
  const [isDirty, setIsDirty] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Display a previously selected value
  useEntityById(value, {
    staleTime: 0, // Needs to be 0 to make sure the entity is fetched on first render
    enabled: !!value && !searchValue,
    onSuccess: entityData => {
      if (!isDirty) {
        setSearchValue(entityData.name);
      }
    },
  });
  const onChangeSearch = newValue => {
    setIsDirty(true);
    setSearchValue(newValue);
  };

  const onSelect = entity => {
    setIsDirty(true);
    onChange(entity.value);
  };

  const {
    data: searchResults,
    isLoading,
    isFetched,
  } = useSearchResults(searchValue, filter, projectCode);

  const displayResults = searchResults?.filter(({ name: entityName }) => {
    if (isDirty || !value) {
      return true;
    }
    return entityName === searchValue;
  });

  return (
    <Container>
      {showLabel ? (
        <Label>{label}</Label>
      ) : (
        <SearchField
          id={id}
          isDirty={isDirty}
          label={label}
          detailLabel={detailLabel}
          name={name!}
          ref={ref}
          onChangeSearch={onChangeSearch}
          searchValue={searchValue}
          invalid={invalid}
          required={required}
        />
      )}
      {errors && errors[name!] && <FormHelperText error>*{errors[name!].message}</FormHelperText>}
      {!isFetched || isLoading ? (
        <SpinningLoader />
      ) : (
        <ResultsList
          value={value}
          onSelect={onSelect}
          searchResults={displayResults}
          showRecentEntities={showRecentEntities}
        />
      )}
    </Container>
  );
};
