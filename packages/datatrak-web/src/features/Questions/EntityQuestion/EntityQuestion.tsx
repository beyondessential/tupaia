/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useFormContext } from 'react-hook-form';
import { FormHelperText, Typography } from '@material-ui/core';
import { SpinningLoader } from '@tupaia/ui-components';
import { SurveyQuestionInputProps } from '../../../types';
import { useEntities, useEntity, useCurrentUser } from '../../../api';
import { useDebounce } from '../../../utils';
import { useSurveyForm } from '../..';
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

const Label = styled(Typography).attrs({
  variant: 'h4',
})`
  font-size: 1rem;
  cursor: pointer;
`;

const useSearchResults = (searchValue, config) => {
  const user = useCurrentUser();
  const projectCode = user.project?.code;
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
  detailLabel,
  name,
  controllerProps: { onChange, value, ref, invalid },
  config,
}: SurveyQuestionInputProps) => {
  const { isReviewScreen, isResponseScreen } = useSurveyForm();
  const { errors } = useFormContext();
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
      {isReviewScreen || isResponseScreen ? (
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
        />
      )}
      {errors && errors[name!] && <FormHelperText error>*{errors[name!].message}</FormHelperText>}
      {!isFetched || isLoading ? (
        <SpinningLoader />
      ) : (
        <ResultsList value={value} onSelect={onSelect} searchResults={displayResults} />
      )}
    </Container>
  );
};
