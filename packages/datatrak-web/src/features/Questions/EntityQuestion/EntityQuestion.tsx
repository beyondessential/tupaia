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

const Container = styled.div`
  width: 100%;
`;

// Todo: Remove this once we have a way to get the country id for the survey (WAITP-1431)
const COUNTRY_CODE = 'TO';

const getEntityBaseFilters = ({ entity: entityConfig }) => {
  return {
    type: entityConfig.type,
    parentId: entityConfig.parentId,
    grandParentId: entityConfig.grandParentId,
    countryCode: COUNTRY_CODE,
  };
};

const useSearchResults = (searchValue, config) => {
  const { data: user } = useUser();
  const projectCode = user?.project?.code;
  const filters = getEntityBaseFilters(config);

  const debouncedSearch = useDebounce(searchValue!, 200);
  return useEntities(projectCode, { searchString: debouncedSearch, ...filters });
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

  const { data: searchResults, isLoading } = useSearchResults(searchValue, config);

  const displayResults = searchResults
    ?.map(({ name: entityName, parentName, id }) => ({
      name: entityName,
      parentName,
      value: id,
      selected: id === value,
    }))
    .filter(({ name }) => {
      if (isDirty || !value) {
        return true;
      }
      return name === searchValue;
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
      {isLoading ? (
        <SpinningLoader />
      ) : (
        <ResultsList onSelect={onSelect} searchResults={displayResults} />
      )}
    </Container>
  );
};
