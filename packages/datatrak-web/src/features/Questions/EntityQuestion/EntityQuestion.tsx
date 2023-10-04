/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { SpinningLoader } from '@tupaia/ui-components';
import { SurveyQuestionInputProps } from '../../../types';
import { useEntities, useEntity, useUser } from '../../../api/queries';
import { useDebounce } from '../../../utils';
import { ResultsList } from './ResultsList';
import { SearchField } from './SearchField';
import { useEntityBaseFilters, useAttributeFilter } from './utils';

const Container = styled.div`
  width: 100%;
  z-index: 0;

  fieldset:disabled & {
    pointer-events: none;
  }
`;

const useSearchResults = (searchValue, config) => {
  const { data: user } = useUser();
  const projectCode = user?.project?.code;
  const filters = useEntityBaseFilters(config);
  const attributeFilter = useAttributeFilter(config);

  const debouncedSearch = useDebounce(searchValue!, 200);
  const query = useEntities(projectCode, { searchString: debouncedSearch, ...filters });
  let entities = query?.data;
  if (attributeFilter) {
    entities = entities?.filter(attributeFilter);
  }
  return { ...query, data: entities };
};

export const EntityQuestion = ({
  id,
  label,
  name,
  controllerProps: { onChange, value, ref },
  config,
}: SurveyQuestionInputProps) => {
  const [isDirty, setIsDirty] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Display a previously selected value
  useEntity(value, {
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

  const { data: searchResults, isLoading, isFetched } = useSearchResults(searchValue, config);

  const displayResults = searchResults?.filter(({ name: entityName }) => {
    if (isDirty || !value) {
      return true;
    }
    return entityName === searchValue;
  });

  return (
    <Container>
      <SearchField
        id={id}
        isDirty={isDirty}
        label={label}
        name={name!}
        ref={ref}
        onChangeSearch={onChangeSearch}
        searchValue={searchValue}
      />
      {!isFetched || isLoading ? (
        <SpinningLoader />
      ) : (
        <ResultsList value={value} onSelect={onSelect} searchResults={displayResults} />
      )}
    </Container>
  );
};
