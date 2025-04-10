import { FormHelperText, FormLabel, FormLabelProps, TypographyProps } from '@material-ui/core';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';

import { Country, Project, SurveyScreenComponentConfig } from '@tupaia/types';
import { SpinningLoader, useDebounce } from '@tupaia/ui-components';

import { useEntityById, useProjectEntities } from '../../api';
import { QrCodeScanner } from './QrCodeScanner';
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

const OrDivider = styled.p.attrs({ children: 'or' })`
  align-items: center;
  column-gap: 1em;
  display: grid;
  font-size: inherit;
  font-weight: 500;
  grid-template-columns: minmax(0, 1fr) min-content minmax(0, 1fr);
  inline-size: 100%;
  margin-block-start: 1em;
  text-box-edge: ex alphabetic; // Specific to the word “or”, which has no ascenders

  &::before,
  &::after {
    block-size: 0;
    border-block-end: max(0.0625rem, 1px) solid currentcolor;
    content: '';
  }
`;

const useSearchResults = (
  searchValue: string,
  filter,
  projectCode: Project['code'] | undefined,
  disableSearch = false,
) => {
  const debouncedSearch = useDebounce(searchValue, 200);
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
  label?: string | null;
  detailLabel?: string | null;
  name?: string | null;
  required?: boolean;
  controllerProps: {
    onChange: (value: string) => void;
    value: string;
    ref: any;
    invalid?: boolean;
  };
  showLegend?: boolean;
  projectCode?: string;
  showRecentEntities?: boolean;
  config?: SurveyScreenComponentConfig | null;
  data?: Record<string, string>;
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
  label,
  detailLabel,
  name,
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
  void useEntityById(value, {
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
          {config?.entity?.allowScanQrCode && (
            <>
              <QrCodeScanner />
              <OrDivider />
            </>
          )}

          {showSearchInput && (
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
