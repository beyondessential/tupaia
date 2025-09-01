import { FormHelperText, FormLabel, FormLabelProps, TypographyProps } from '@material-ui/core';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';

import { Country, Project, SurveyScreenComponentConfig } from '@tupaia/types';
import { SpinningLoader, useDebounce } from '@tupaia/ui-components';

import { useEntityById, useProjectEntities } from '../../api';
import { useSurveyForm } from '../Survey';
import { QrCodeScanner, QrCodeScannerProps } from './QrCodeScanner';
import { ResultsList, ResultsListProps } from './ResultsList';
import { SearchField } from './SearchField';
import { useEntityBaseFilters } from './useEntityBaseFilters';
import { OrDivider } from '../../components';

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
  name?: string | null;
  label?: string | null;
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
  void useEntityById(value, {
    staleTime: 0, // Needs to be 0 to make sure the entity is fetched on first render
    enabled: !!value && !searchValue,
    onSuccess: entityData => {
      if (!isDirty) {
        setSearchValue(entityData.name);
      }
    },
  });

  const onChangeSearch = (newValue: string) => {
    setIsDirty(true);
    setSearchValue(newValue);
  };

  const onSelect: ResultsListProps['onSelect'] = entity => {
    setIsDirty(true);
    onChange(entity.value);
  };

  const onQrCodeScannerResult: QrCodeScannerProps['onSuccess'] = entity => {
    setIsDirty(true);
    setSearchValue(entity.name); // Unnecessary, but ensures selected entity is visible
    onChange(entity.id);
  };

  const filters = useEntityBaseFilters(config, data, countryCode);
  const { data: validEntities } = useProjectEntities(projectCode, {
    fields: ['id', 'name'], // Only these are used by `onQrCodeScannerResult`
    filter: filters,
  });
  const {
    data: searchResults,
    isFetching: isFetchingSearchResults,
    isFetched,
  } = useSearchResults(searchValue, filters, projectCode, disableSearch);

  const { isResponseScreen, isReviewScreen } = useSurveyForm();
  const showQrCodeScanner = config?.entity?.allowScanQrCode && !isResponseScreen && !isReviewScreen;

  const displayResults = searchResults?.filter(
    entity => isDirty || !value || entity.name === searchValue,
  );

  const showLoader = isLoading || ((isFetchingSearchResults || !isFetched) && !disableSearch);

  return (
    <>
      <Container>
        {showLegend && (
          <Label {...legendProps} id="entity-selector-legend">
            {legend}
          </Label>
        )}
        <div className="entity-selector-content">
          {showQrCodeScanner && (
            <>
              <QrCodeScanner onSuccess={onQrCodeScannerResult} validEntities={validEntities} />
              <OrDivider />
            </>
          )}

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
