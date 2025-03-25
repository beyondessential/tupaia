import React, { useState } from 'react';
import styled from 'styled-components';
import { useFormContext } from 'react-hook-form';
import { FormHelperText, FormLabel, FormLabelProps, TypographyProps } from '@material-ui/core';
import { Country, SurveyScreenComponentConfig } from '@tupaia/types';
import { SpinningLoader, useDebounce } from '@tupaia/ui-components';
import { useEntityById, useProjectEntities } from '../../api';
import { ResultsList } from './ResultsList';
import { SearchField } from './SearchField';
import { useEntityBaseFilters } from './useEntityBaseFilters';

const Container = styled.div`
  width: 100%;
  z-index: 0;

  fieldset:disabled & {
    pointer-events: none;
  }
`;

const Label = styled(FormLabel)`
  font-size: 1rem;
  cursor: pointer;
`;

const useSearchResults = (searchValue, filter, projectCode, disableSearch = false) => {
  const debouncedSearch = useDebounce(searchValue!, 200);
  return useProjectEntities(
    projectCode,
    {
      fields: ['id', 'parent_name', 'code', 'name', 'type'],
      filter,
      searchString: debouncedSearch,
      pageSize: 100,
    },
    { enabled: !disableSearch },
  );
};

interface EntitySelectorProps {
  id: string;
  name?: string | null;
  label?: string | null;
  required?: boolean | null;
  controllerProps: {
    onChange: (value: string) => void;
    value: string;
    ref: any;
    invalid?: boolean;
  };
  showLegend: boolean;
  projectCode?: string;
  showRecentEntities?: boolean;
  config?: SurveyScreenComponentConfig | null;
  data?: Record<string, any>;
  countryCode?: Country['code'];
  disableSearch?: boolean;
  isLoading?: boolean;
  showSearchInput?: boolean;
  legend?: string | null;
  legendProps?: FormLabelProps & {
    component?: React.ElementType;
    variant?: TypographyProps['variant'];
  };
  noResultsMessage?: string;
}

export const EntitySelector = ({
  id,
  name,
  label,
  required,
  controllerProps: { onChange, value, ref, invalid },
  projectCode,
  showLegend,
  showRecentEntities,
  config,
  data,
  countryCode,
  disableSearch,
  isLoading,
  showSearchInput,
  legend,
  legendProps,
  noResultsMessage,
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

  const filters = useEntityBaseFilters(config, data, countryCode);

  const {
    data: searchResults,
    isLoading: isLoadingSearchResults,
    isFetched,
  } = useSearchResults(searchValue, filters, projectCode, disableSearch);

  const displayResults = searchResults?.filter(({ name: entityName }) => {
    if (isDirty || !value) {
      return true;
    }
    return entityName === searchValue;
  });

  const showLoader = isLoading || ((isLoadingSearchResults || !isFetched) && !disableSearch);

  return (
    <>
      <Container>
        {showLegend && (
          <Label {...legendProps} id="entity-selector-legend">
            {legend}
          </Label>
        )}
        <div className="entity-selector-content">
          {showSearchInput && (
            <SearchField
              id={id}
              isDirty={isDirty}
              name={name!}
              ref={ref}
              onChangeSearch={onChangeSearch}
              searchValue={searchValue}
              invalid={invalid}
              required={required}
              inputProps={{
                'aria-labelledby': showLegend && !label ? 'entity-selector-legend' : undefined,
              }}
            />
          )}
          {showLoader ? (
            <SpinningLoader />
          ) : (
            <ResultsList
              searchValue={searchValue}
              value={value}
              onSelect={onSelect}
              searchResults={disableSearch ? [] : displayResults}
              showRecentEntities={showRecentEntities}
              noResultsMessage={noResultsMessage}
            />
          )}
        </div>
      </Container>
      {errors?.[name!] && <FormHelperText error>{errors[name!].message}</FormHelperText>}
    </>
  );
};
