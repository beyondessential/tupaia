/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { useSearchDataSources, getQueryFnFromReportServer } from '../../api';
import { DataLibrary } from '@tupaia/ui-components';
import PropTypes from 'prop-types';
import { useDebounce } from '../../../utilities';

const MAX_RESULTS = 10;

const aggregateToValue = aggregate =>
  aggregate.map(({ type, config }) => ({ code: type, type: 'aggregationOption', config }));

const valueToAggregate = value => value.map(({ code, config }) => ({ type: code, config }));

export const AggregationDataLibrary = ({ aggregate, onAggregatehange }) => {
  const [inputValue, setInputValue] = useState('');
  const value = aggregateToValue(aggregate);
  const debouncedInputValue = useDebounce(inputValue, 200);

  const { data: aggregationOptionSearchResults, isFetching } = useSearchDataSources({
    getQueryFn: getQueryFnFromReportServer,
    search: debouncedInputValue,
    type: 'aggregateOption',
  });

  const options = inputValue ? aggregationOptionSearchResults : [];

  return (
    <DataLibrary
      options={options}
      value={value}
      onChange={(event, newValue) => onAggregatehange(valueToAggregate(newValue))}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => (event ? setInputValue(newInputValue) : false)}
      isLoading={isFetching}
      searchPageSize={MAX_RESULTS}
    />
  );
};

AggregationDataLibrary.propTypes = {
  aggregate: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string.isRequired,
        config: PropTypes.object,
      }),
    ),
    PropTypes.string,
  ]).isRequired,
  onAggregatehange: PropTypes.func.isRequired,
};
